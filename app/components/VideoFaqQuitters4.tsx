"use client"
import styles from "../page.module.css";

const VideoFaqQuitters4 = () => {
    return(
        <video controls style={{zIndex: 2, position: 'relative', marginBottom: 40}} className={styles.videoFaq} muted autoPlay loop width="500" height="500">
        <source src="/how do I pay the coach through the app.mp4" type="video/mp4" />
      </video>
    )
}

export default VideoFaqQuitters4