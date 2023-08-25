import { View, TextInput, Pressable } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Colors } from "@/app/colors";
import { CameraFilled } from "@ant-design/icons";
import styles from "./modulesAndExercises.module.css";
import YouTube from 'react-youtube';
import Image from "next/image";

interface IProps {
  title: string;
  short: string;
  index: number;
  isExerciseShow: boolean;
  isModuleShow: boolean;
  handleInputChangeTitle: (text: string, index: number, isEx: boolean) => void;
  handleInputChangeShort: (text: string, index: number, isEx: boolean) => void;
  handleInputChangeFull: (text: string, index: number, isEx: boolean) => void;
  handleSaveUploadedImage: (event: any, index: number, isEx: boolean) => void;
  handleSaveVideoId: (text: string, index: number, isEx: boolean) => void;
  handleSaveVideo: (event: any, index: number, isEx: boolean) => void;
  videoUploaded: string;
  uploadedImage: string;
  fullDescripion: string;
  youTubeId: string;
  isViewFromHomeWork: boolean;
}

const ModulesAndExercisesFullScreen = ({
  isViewFromHomeWork = false,
  videoUploaded,
  uploadedImage,
  fullDescripion,
  youTubeId,
  isExerciseShow,
  isModuleShow,
  handleInputChangeTitle,
  handleInputChangeShort,
  handleInputChangeFull,
  handleSaveUploadedImage,
  handleSaveVideoId,
  handleSaveVideo,
  title,
  short,
  index,
}: IProps) => {
  const [textTitle, setTextTitle] = useState(title);
  const [textShort, setTextShort] = useState(short);
  const [fullDescription, setFullDescription] = useState("");
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");

  const [link, setLink] = useState("");

  function getYouTubeVideoId(url: string) {
    var regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : "";
  }

  const [videoIdYouTube, setVideoId] = useState("");
  const setLinkAsImage = () => {
    let isEx = false;
    if (isExerciseShow) {
      isEx = true;
    }
    if (isModuleShow) {
      isEx = false;
    }
    if (link.includes("youtube")) {
      const videoId = getYouTubeVideoId(link);
      setImage("");
      setVideo("");
      handleRemoveVideo()
      setLink("");
      setVideoId(videoId);
      handleSaveVideoId(videoId, index, isEx);
    } else {
      setLink("");
      setVideo("");
      handleRemoveVideo()
      setImage(link);
      handleSaveUploadedImage(link, index, isEx);
    }

    setLink("");
  };

  const [playing, setPlaying] = useState(false);

  const onStateChange = useCallback((state: any) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    console.log("UPLOADED IMAGE", uploadedImage)
    if (uploadedImage !== "") {
      let uploadedImageLocal = uploadedImage;
      if (uploadedImage instanceof File) {
        uploadedImageLocal = URL.createObjectURL(uploadedImage);
      }

      setImage(uploadedImageLocal);
    }
    if (videoUploaded !== "") {

      let videoLocal = videoUploaded;
      if (videoUploaded instanceof File) {
        videoLocal = URL.createObjectURL(videoUploaded);
      }

      setVideo(videoLocal);
    }
    if (youTubeId !== "") {
      setVideoId(youTubeId);
    }
    if (fullDescripion !== "") {
      setFullDescription(fullDescripion);
    }
  }, []);
  const fileInputRef = useRef(null);

  const handleRemoveVideo = () => {
    // Reset the value of the file input element video
    fileInputRef.current.value = null;
  };

  const opts = {
    height: '290',
    width: '520',
    playerVars: {
      // Add any additional player parameters here
    },
  };
  let textForFullDescription = ""
  if(isExerciseShow) {
    textForFullDescription = "exercise"
  }

  if(isModuleShow) {
    textForFullDescription = "module"
  }
  return (
    <View style={{ backgroundColor: Colors.white, height: "100%" }}>
      <View style={{ backgroundColor: Colors.white, height: "100%" }}>
        <>
          {!isViewFromHomeWork &&
            image === "" &&
            video == "" &&
            videoIdYouTube === "" && (
              <View
                style={{
                  width: "100%",
                  height: 300,
                  backgroundColor: Colors.lightGray,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CameraFilled
                  style={{ color: Colors.blackCardDarkMode, fontSize: 40 }}
                />
              </View>
            )}
          {image !== undefined && image !== "" && !image.includes("youtube") && (
            <View style={{
              backgroundColor: Colors.darkGray,
              width: "100%",
              height: 300,
            }}>
              <Image
              fill
              alt="uploaded image"
                src={ image }
              />
            </View>
          )}
          
          {videoIdYouTube !== "" && image === "" && video == "" && (
            <>
              {/* <YoutubePlayer
                  height={300}
                  play={playing}
                  videoId={videoIdYouTube}
                  onChangeState={onStateChange}
                /> */}
                <YouTube videoId={videoIdYouTube} opts={opts} />
             
            </>
          )}
          {video !== "" && image === "" && (
            <View style={{ backgroundColor: Colors.lightGray }}>
              <video style={{width: "100%", height: "300px"}} controls>
                <source src={video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </View>
          )}
          {!isViewFromHomeWork && (
            <>
              <View
                style={{
                  alignItems: "center",
                  marginTop: 20,
                  flexDirection: "row",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Pressable>
                  <View
                    style={{
                      backgroundColor: Colors.darkGray,
                      borderRadius: 50,
                      padding: 15,
                      marginTop: 20,
                      marginRight: 15,
                    }}
                  >
                    <label className={styles.label}>
                      <input
                        onChange={(event) => {
                          let isEx = false;
                          if (isExerciseShow) {
                            isEx = true;
                          }
                          if (isModuleShow) {
                            isEx = false;
                          }
                          const file = event.target.files[0];
                          const url = URL.createObjectURL(file);
                          setImage(url);
                          handleRemoveVideo()
                          handleSaveUploadedImage(event, index, isEx);
                          
                          
                        }}
                        id="file"
                        accept="image/jpeg,image/png"
                        name="fileToUpload"
                        type="file"
                      />
                      <span style={{ color: Colors.white }}>Upload Image</span>
                    </label>
                  </View>
                </Pressable>
                <Pressable>
                  <View
                    style={{
                      backgroundColor: Colors.darkGray,
                      borderRadius: 50,
                      padding: 15,
                      marginTop: 20,
                    }}
                  >
                    <label className={styles.label}>
                      <input
                      ref={fileInputRef}
                        onChange={(event) => {
                          let isEx = false;
                          if (isExerciseShow) {
                            isEx = true;
                          }
                          if (isModuleShow) {
                            isEx = false;
                          }
                          const file = event.target.files[0];
                          const url = URL.createObjectURL(file);
                        console.log("URL VIDEO", url)
                          setVideo(url);
                          setImage("")
                          handleSaveVideo(event, index, isEx);
                          

                        }}
                        id="fileVideo"
                        accept="video/mp4"
                        name="fileToUploadVideo"
                        type="file"
                      />
                      <span style={{ color: Colors.white }}>Upload Video</span>
                    </label>
                  </View>
                </Pressable>
              </View>
            </>
          )}
        </>

        {!isViewFromHomeWork && (
          <span style={{ fontSize: 25, marginTop: 20 }}>{"\u2022"} Title</span>
        )}
        <View style={{ padding: 20, marginTop: -10 }}>
          <TextInput
            editable={isViewFromHomeWork ? false : true}
            style={{ fontSize: 25, width: "90%" }}
            value={textTitle}
            multiline
            numberOfLines={4}
            placeholder="Edit Title"
            placeholderTextColor={Colors.blackCardDarkMode}
            onChangeText={(text) => {
              let isEx = false;
              if (isExerciseShow) {
                isEx = true;
              }
              if (isModuleShow) {
                isEx = false;
              }
              setTextTitle(text);
              handleInputChangeTitle(text, index, isEx);
            }}
          />
        </View>
        {!isViewFromHomeWork && (
          <span style={{ fontSize: 25, marginTop: 20 }}>
            {"\u2022"} Full description
          </span>
        )}
        <View style={{ padding: 20, marginTop: -10 }}>
          <textarea
            readOnly={isViewFromHomeWork ? true : false}
            style={{ fontSize: 20, width: "90%", border:"none", resize:"none" }}
            value={fullDescription}
            rows={fullDescription === "" ? 2 : 40}
            placeholder={
              isViewFromHomeWork
                ? ""
                : `Enter the full description of the ${
                  textForFullDescription}`
            }
            onChange={(e) => {
              let isEx = false;
              if (isExerciseShow) {
                isEx = true;
              }
              if (isModuleShow) {
                isEx = false;
              }
              setFullDescription(e.target.value);
              handleInputChangeFull(e.target.value, index, isEx);
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default ModulesAndExercisesFullScreen