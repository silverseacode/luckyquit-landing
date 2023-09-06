"use client"
import styles from "../page.module.css";

const VideoFaqCoaches5 = () => {
    return(
        <video controls style={{zIndex: 2, position: 'relative', marginBottom: 40}} className={styles.videoFaq} muted autoPlay loop width="400" height="400">
        <source src="/How can I create modules and exercises for the quitter.mp4" type="video/mp4" />
      </video>
    )
}

export default VideoFaqCoaches5