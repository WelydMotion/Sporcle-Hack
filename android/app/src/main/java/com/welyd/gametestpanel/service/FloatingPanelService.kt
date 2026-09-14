package com.welyd.gametestpanel.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.ComposeView
import androidx.core.app.NotificationCompat
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.lifecycle.setViewTreeViewModelStoreOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import com.welyd.gametestpanel.MainActivity
import com.welyd.gametestpanel.R
import com.welyd.gametestpanel.model.Room
import com.welyd.gametestpanel.network.ApiClient
import com.welyd.gametestpanel.repository.RoomRepository
import com.welyd.gametestpanel.repository.SessionManager
import com.welyd.gametestpanel.settings.SettingsManager
import com.welyd.gametestpanel.ui.FloatingBubbleView
import com.welyd.gametestpanel.ui.theme.WelydGameTestPanelTheme
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

/**
 * Foreground Service that mounts a draggable system overlay bubble (and expandable compact panel)
 * on top of running games and apps.
 */
class FloatingPanelService : Service() {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    private var layoutParams: WindowManager.LayoutParams? = null

    private var isExpanded by mutableStateOf(false)

    // Dependencies
    private lateinit var settingsManager: SettingsManager
    private lateinit var repository: RoomRepository

    companion object {
        const val CHANNEL_ID = "welyd_floating_channel"
        const val NOTIFICATION_ID = 1946
        const val ACTION_STOP = "com.welyd.gametestpanel.STOP_OVERLAY"

        const val PREF_NAME = "welyd_bubble_position"
        const val KEY_POS_X = "bubble_x"
        const val KEY_POS_Y = "bubble_y"
    }

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        settingsManager = SettingsManager(applicationContext)

        val apiClient = ApiClient()
        val sessionManager = SessionManager()
        repository = RoomRepository(apiClient, sessionManager, serviceScope)

        serviceScope.launch {
            val settings = settingsManager.settingsFlow.first()
            repository.onSettingsChanged(settings)
        }

        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification())
        createFloatingOverlay()
    }

    private fun createFloatingOverlay() {
        val prefs = getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        val initialX = prefs.getInt(KEY_POS_X, 60)
        val initialY = prefs.getInt(KEY_POS_Y, 200)

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        layoutParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = initialX
            y = initialY
        }

        val composeView = ComposeView(this).apply {
            setContent {
                WelydGameTestPanelTheme {
                    val room by repository.currentRoom.collectAsState()

                    FloatingBubbleView(
                        isExpanded = isExpanded,
                        room = room,
                        onToggleExpand = {
                            isExpanded = !isExpanded
                        },
                        onRefresh = {
                            serviceScope.launch {
                                val s = settingsManager.settingsFlow.first()
                                repository.refreshRoom(s.roomId, s.playerId, s.demoMode)
                            }
                        },
                        onClaimHost = {
                            serviceScope.launch {
                                val s = settingsManager.settingsFlow.first()
                                if (room.isHost) {
                                    repository.releaseHost(s.roomId, s.playerId, s.demoMode)
                                } else {
                                    repository.claimHost(s.roomId, s.playerId, s.demoMode)
                                }
                            }
                        },
                        onLeaveRoom = {
                            serviceScope.launch {
                                val s = settingsManager.settingsFlow.first()
                                repository.leaveRoom(s.roomId, s.playerId, s.demoMode)
                            }
                        },
                        onCloseService = {
                            stopSelf()
                        },
                        onDragDelta = { dx, dy ->
                            layoutParams?.let { params ->
                                params.x += dx.toInt()
                                params.y += dy.toInt()
                                windowManager?.updateViewLayout(this@apply, params)

                                // Persist position
                                prefs.edit()
                                    .putInt(KEY_POS_X, params.x)
                                    .putInt(KEY_POS_Y, params.y)
                                    .apply()
                            }
                        }
                    )
                }
            }
        }

        overlayView = composeView
        try {
            windowManager?.addView(overlayView, layoutParams)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                getString(R.string.channel_name),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = getString(R.string.channel_description)
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        val openAppIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, openAppIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(getString(R.string.floating_service_notification_title))
            .setContentText(getString(R.string.floating_service_notification_desc))
            .setSmallIcon(R.drawable.ic_welyd_bubble)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopSelf()
            return START_NOT_STICKY
        }
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
        overlayView?.let {
            try {
                windowManager?.removeView(it)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        overlayView = null
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
