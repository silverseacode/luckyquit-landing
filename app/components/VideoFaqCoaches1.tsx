"use client"
import styles from "../page.module.css";

const VideoFaqCoaches1 = () => {
    return(
        <video controls style={{zIndex: 2, position: 'relative', marginBottom: 40}} className={styles.videoFaq} muted autoPlay loop width="500" height="500">
        <source src="/how can I start earning money as a coach.mp4" type="video/mp4" />
      </video>
    )
}

export default VideoFaqCoaches1