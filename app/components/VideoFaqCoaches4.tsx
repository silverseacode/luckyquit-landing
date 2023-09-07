"use client"
import styles from "../page.module.css";

const VideoFaqCoaches4 = () => {
    return(
        <video controls style={{zIndex: 2, position: 'relative', marginBottom: 40}} className={styles.videoFaq} muted autoPlay loop width="500" height="500">
        <source src="/How much can I earn.mp4" type="video/mp4" />
      </video>
    )
}

export default VideoFaqCoaches4