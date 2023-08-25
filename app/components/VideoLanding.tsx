"use client"
import styles from "../page.module.css";

const VideoLanding = () => {
    return(
        <video style={{zIndex: 2, position: 'relative'}} className={styles.imagePhone} muted autoPlay loop width="800" height="800">
        <source src="/hand-video.mp4" type="video/mp4" />
      </video>
    )
}

export default VideoLanding