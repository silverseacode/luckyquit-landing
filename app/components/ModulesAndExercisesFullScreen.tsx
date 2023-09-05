"use client";
import { View, TextInput, Pressable } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Colors } from "@/app/colors";
import { CameraFilled } from "@ant-design/icons";
import styles from "./modulesAndExercises.module.css";
import YouTube from "react-youtube";
import Image from "next/image";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
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
  isSavingMainAsset: boolean;
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
  isSavingMainAsset,
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
      handleRemoveVideo();
      setLink("");
      setVideoId(videoId);
      handleSaveVideoId(videoId, index, isEx);
    } else {
      setLink("");
      setVideo("");
      handleRemoveVideo();
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
    console.log("UPLOADED IMAGE", uploadedImage);
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
    height: "290",
    width: "520",
    playerVars: {
      // Add any additional player parameters here
    },
  };
  let textForFullDescription = "";
  if (isExerciseShow) {
    textForFullDescription = "exercise";
  }

  if (isModuleShow) {
    textForFullDescription = "module";
  }

  const reactQuillRef = useRef();
  const reactQuillRefFull = useRef();

  const checkCharacterCount = (event: any) => {
    const unprivilegedEditor = reactQuillRef.current.unprivilegedEditor;
    if (unprivilegedEditor.getLength() > 50 && event.key !== "Backspace")
      event.preventDefault();
  };

  const checkCharacterCountFull = (event: any) => {
    const unprivilegedEditor = reactQuillRefFull.current.unprivilegedEditor;
    if (unprivilegedEditor.getLength() > 1500 && event.key !== "Backspace")
      event.preventDefault();
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [errorMaxSize, setErrorMaxSize] = useState("");

  const checkSizeOfVideoFile = async (event: any) => {
    const maxSizeAllowed = 500 * 1024 * 1024;
    const file = event.target.files[0];
    const fileSizeInBytes = file.size;
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
    if (file && file.size > maxSizeAllowed) {
      setErrorMaxSize(
        `Your file has the size of ${fileSizeInMB}MB, the max allowed is 500MB.`
      );
      return
    } else {
      setErrorMaxSize("");
    }

    let isEx = false;
    if (isExerciseShow) {
      isEx = true;
    }
    if (isModuleShow) {
      isEx = false;
    }
    const url = URL.createObjectURL(file);
    console.log("URL VIDEO", url);
    setVideo(url);
    setImage("");
    handleSaveVideo(event, index, isEx);
  };

  if (!isMounted) return null;

  return (
    <View style={{ backgroundColor: Colors.white, height: "100%" }}>
      <View style={{ backgroundColor: Colors.white, height: "100%" }}>
        {isSavingMainAsset ? (
          <View
            style={{
              width: "100%",
              height: 300,
              backgroundColor: Colors.lightGray,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className={styles.spinnerOverlay}>
              <div className={styles.spinnerContainer}></div>
            </div>
          </View>
        ) : (
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
            {image !== undefined &&
              image !== "" &&
              !image.includes("youtube") && (
                <View
                  style={{
                    backgroundColor: Colors.darkGray,
                    width: "100%",
                    height: 300,
                  }}
                >
                  <Image fill alt="uploaded image" src={image} />
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
                <video style={{ width: "100%", height: "300px" }} controls>
                  <source src={video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </View>
            )}
            {errorMaxSize !== "" && (
              <div
                style={{
                  color: Colors.red,
                  textAlign: "center",
                  marginTop: 20,
                }}
              >
                Your file has the size of 10MB, the max allowed is 500mb
              </div>
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
                            handleRemoveVideo();
                            handleSaveUploadedImage(event, index, isEx);
                          }}
                          id="file"
                          accept="image/jpeg,image/png"
                          name="fileToUpload"
                          type="file"
                        />
                        <span style={{ color: Colors.white }}>
                          Upload Image
                        </span>
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
                          onChange={async (event) => {
                            checkSizeOfVideoFile(event);
                          }}
                          id="fileVideo"
                          accept="video/mp4"
                          name="fileToUploadVideo"
                          type="file"
                        />
                        <span style={{ color: Colors.white }}>
                          Upload Video
                        </span>
                      </label>
                    </View>
                  </Pressable>
                </View>
              </>
            )}
          </>
        )}

        {!isViewFromHomeWork && (
          <span style={{ fontSize: 25, marginTop: 20 }}>{"\u2022"} Title</span>
        )}
        <View style={{ padding: 20, marginTop: -10 }}>
          {/* <TextInput
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
          /> */}
          {!isViewFromHomeWork ? (
            <ReactQuill
              onKeyDown={checkCharacterCount}
              ref={reactQuillRef}
              theme="snow"
              value={textTitle}
              onChange={(value) => {
                let isEx = false;
                if (isExerciseShow) {
                  isEx = true;
                }
                if (isModuleShow) {
                  isEx = false;
                }
                setTextTitle(value);
                handleInputChangeTitle(value, index, isEx);
              }}
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ["bold", "italic", "underline", "strike", "blockquote"],
                  [
                    {
                      color: [
                        "#000000",
                        "#e60000",
                        "#ff9900",
                        "#ffff00",
                        "#008a00",
                        "#0066cc",
                        "#9933ff",
                        "#ffffff",
                        "#facccc",
                        "#ffebcc",
                        "#ffffcc",
                        "#cce8cc",
                        "#cce0f5",
                        "#ebd6ff",
                        "#bbbbbb",
                        "#f06666",
                        "#ffc266",
                        "#ffff66",
                        "#66b966",
                        "#66a3e0",
                        "#c285ff",
                        "#888888",
                        "#a10000",
                        "#b26b00",
                        "#b2b200",
                        "#006100",
                        "#0047b2",
                        "#6b24b2",
                        "#444444",
                        "#5c0000",
                        "#663d00",
                        "#666600",
                        "#003700",
                        "#002966",
                        "#3d1466",
                        "custom-color",
                      ],
                    },
                  ],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["clean"],
                ],
              }}
              formats={[
                "header",
                "bold",
                "italic",
                "underline",
                "strike",
                "blockquote",
                "list",
                "bullet",
                "image",
                "color",
              ]}
            />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: textTitle }} />
          )}
        </View>
        {!isViewFromHomeWork && (
          <span style={{ fontSize: 25, marginTop: 20 }}>
            {"\u2022"} Full description
          </span>
        )}
        <View style={{ padding: 20, marginTop: -10 }}>
          {/* <textarea
            readOnly={isViewFromHomeWork ? true : false}
            style={{
              fontSize: 20,
              width: "90%",
              border: "none",
              resize: "none",
            }}
            value={fullDescription}
            rows={fullDescription === "" ? 2 : 40}
            placeholder={
              isViewFromHomeWork
                ? ""
                : `Enter the full description of the ${textForFullDescription}`
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
          /> */}
          {!isViewFromHomeWork ? (
            <ReactQuill
              onKeyDown={checkCharacterCountFull}
              ref={reactQuillRefFull}
              theme="snow"
              value={fullDescription}
              style={{ height: 500 }}
              onChange={(value) => {
                console.log(333, value);
                let isEx = false;
                if (isExerciseShow) {
                  isEx = true;
                }
                if (isModuleShow) {
                  isEx = false;
                }
                setFullDescription(value);
                handleInputChangeFull(value, index, isEx);
              }}
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ["bold", "italic", "underline", "strike", "blockquote"],
                  [
                    {
                      color: [
                        "#000000",
                        "#e60000",
                        "#ff9900",
                        "#ffff00",
                        "#008a00",
                        "#0066cc",
                        "#9933ff",
                        "#ffffff",
                        "#facccc",
                        "#ffebcc",
                        "#ffffcc",
                        "#cce8cc",
                        "#cce0f5",
                        "#ebd6ff",
                        "#bbbbbb",
                        "#f06666",
                        "#ffc266",
                        "#ffff66",
                        "#66b966",
                        "#66a3e0",
                        "#c285ff",
                        "#888888",
                        "#a10000",
                        "#b26b00",
                        "#b2b200",
                        "#006100",
                        "#0047b2",
                        "#6b24b2",
                        "#444444",
                        "#5c0000",
                        "#663d00",
                        "#666600",
                        "#003700",
                        "#002966",
                        "#3d1466",
                        "custom-color",
                      ],
                    },
                  ],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["clean"],
                ],
              }}
              formats={[
                "header",
                "bold",
                "italic",
                "underline",
                "strike",
                "blockquote",
                "list",
                "bullet",
                "image",
                "color",
              ]}
            />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: fullDescription }} />
          )}
        </View>
      </View>
    </View>
  );
};

export default ModulesAndExercisesFullScreen;
