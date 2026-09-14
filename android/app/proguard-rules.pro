# Proguard rules for WELYD Game Test Panel
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# Keep data models for Kotlinx Serialization
-keepclassmembers class * {
    @kotlinx.serialization.SerialName <fields>;
}
-keepattributes *Annotation*,SourceFile,LineNumberTable
-dontwarn okhttp3.**
-dontwarn okio.**
