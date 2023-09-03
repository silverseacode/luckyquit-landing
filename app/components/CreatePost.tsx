"use client";
import { Post, User } from "@/models";
import styles from "./create-post.module.css";
import { Modal, Switch } from "@mui/material";
import { Suspense, createRef, useCallback, useEffect, useState } from "react";
import { Pressable, View, TextInput } from "react-native";
import { Colors } from "../colors";
import { InfoCircleOutlined } from "@ant-design/icons";
import CloseIcon from "@mui/icons-material/Close";
import { createPostBE, getPostByIdBE } from "@/helpers/posts";
import axios from "axios";
import { API_URL } from "@/config";
import Image from "next/image";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { v4 as uuidv4 } from "uuid";
import mixpanel from 'mixpanel-browser';

interface IProps {
  user: User | undefined;
  setNewPostAdded: (value: Post) => void;
}
const CreatePost = ({ user, setNewPostAdded }: IProps) => {
  const [openModal, setOpenModal] = useState(false);

  const [base64, setBase64] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>("");
  useEffect(() => {
    const itemUUID = localStorage.getItem("UUID");
    const myUserId = itemUUID ? itemUUID : null;
    setMyUserId(myUserId);
  }, []);

  const [valueSwitch, setSwitch] = useState(true);
  const [file, setFile] = useState();
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const createPost = async () => {
    if (myUserId !== null) {
      setIsCreatingPost(true);
      const date = new Date();
      const options = { timeZone: user?.timezone[0] };
      const dateTimezone = date.toLocaleString("en-US", options);
      const idv4 = uuidv4();

      let newPost = {
        idv4,
        userId: myUserId,
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        pictureUser: user?.profilePicture?.split?.("/")?.[3]?.split?.("?")?.[0] ?? '',
        picturePost: "",
        description: text,
        allowComments: valueSwitch,
        likes: [],
        comments: [],
        timeAgo: dateTimezone,
        userName: user?.userName ?? "",
        initials: user?.initials ?? "",
        backgroundColor: user?.backgroundColor ?? "",
        userType: user?.type
      };
      setOpenModal(false);
      const newPostFromBE = await createPostBE(newPost);

      const postBE = newPostFromBE.response.res;

      if (file !== undefined) {
        const formData = new FormData();
        formData.append("image", file);
        await Promise.all([
          axios.post(
            `${API_URL}/post/uploadImagePost/${postBE.idv4}`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          ),
        ]);
      }
      const postRes = await getPostByIdBE(postBE.idv4);
      const post = postRes.response.post;
      mixpanel.track('Created new post web');
      setIsCreatingPost(false);
      setNewPostAdded(post);
    }
  };

  const [text, setText] = useState("");

  const removeFile = () => {
    setFile(undefined);
  };

  const [fileLargeMessage, setFileLargeMessage] = useState("");

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        {user?.profilePicture !== "" && user?.profilePicture !== undefined ? (
          <img className={styles.imageProfile} src={user?.profilePicture}></img>
        ) : (
          <View
            style={{
              height: 50,
              width: 50,
              borderRadius: 50,
              backgroundColor: user?.backgroundColor,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span style={{ color: Colors.blackDefault, fontSize: 16 }}>
              {user?.initials}
            </span>
          </View>
        )}
        <input
          onClick={() => setOpenModal(true)}
          type="text"
          className={styles.input}
          placeholder="What's in your mind?"
        />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <Modal
          className={styles.modal}
          open={openModal}
          onClose={() => setOpenModal(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <div className={styles.containerModal}>
            <View
              style={{
                backgroundColor: Colors.primary,
                height: 60,
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: "row",
                paddingTop: 0,
              }}
            >
              <Pressable onPress={() => setOpenModal(false)}>
                <View style={{ marginLeft: 15 }}>
                  <CloseIcon style={{ color: Colors.white, fontSize: 30 }} />
                </View>
              </Pressable>
              <span
                style={{ color: Colors.white, fontSize: 18, marginLeft: 55 }}
              >
                Create New Post
              </span>
              <Pressable onPress={() => createPost()}>
                <span
                  style={{ color: Colors.white, fontSize: 18, marginRight: 15 }}
                >
                  Publish
                </span>
              </Pressable>
            </View>
            {!isCreatingPost ? (
              <View style={{ marginHorizontal: 20 }}>
                <View
                  style={{
                    marginTop: 20,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      borderRadius: 50,
                      height: 70,
                      width: 70,
                    }}
                  >
                    {user?.profilePicture !== "" &&
                    user?.profilePicture !== undefined ? (
                      <Image
                        alt="profile pic"
                        src={user?.profilePicture ?? ""}
                        width={70}
                        height={70}
                        style={{
                          width: 70,
                          height: 70,
                          borderRadius: 50,
                        }}
                      />
                    ) : (
                      <View
                        style={{
                          height: 70,
                          width: 70,
                          borderRadius: 50,
                          backgroundColor: user?.backgroundColor,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{ color: Colors.blackDefault, fontSize: 16 }}
                        >
                          {user?.initials}
                        </span>
                      </View>
                    )}
                  </View>
                  <View>
                    <View style={{ marginLeft: 10 }}>
                      <span
                        style={{ fontSize: 18 }}
                      >{`${user?.firstName} ${user?.lastName}`}</span>
                    </View>
                    <View>
                      <span
                        style={{
                          fontSize: 18,
                          color: Colors.blue,
                          marginLeft: 10,
                        }}
                      >
                        @{user?.userName}
                      </span>
                    </View>
                  </View>
                </View>
                {user?.type === "coach" && (
                  <View style={{ marginTop: 15, flexDirection: "row" }}>
                    <InfoCircleOutlined
                      style={{ fontSize: 24, color: Colors.darkGray }}
                    />
                    <span
                      style={{
                        color: Colors.darkGray,
                        fontSize: 14,
                        marginLeft: 7,
                        marginBottom: 0,
                      }}
                    >
                      Write something to get more clients
                    </span>
                  </View>
                )}
                <View
                  style={{
                    marginTop: 20,
                    marginLeft: 20,
                    height: "25%",
                  }}
                >
                  <TextInput
                    value={text}
                    multiline
                    numberOfLines={8}
                    maxLength={500}
                    onChangeText={setText}
                    placeholder={`What's on your mind?`}
                    style={{ borderRadius: 8, maxWidth: 300, fontSize: 19 }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    position: "relative",
                    marginRight: 10,
                  }}
                >
                  <span style={{ color: Colors.red }}>{fileLargeMessage}</span>
                  <span style={{ fontSize: 17 }}>{text.length}/500</span>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ marginTop: 20, marginLeft: 20 }}>
                    {file === undefined && (
                      <View style={{ flexDirection: "row" }}>
                        <label className={styles.label}>
                          <input
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file.size > 10485760) {
                                setFileLargeMessage(
                                  "The maximum size of the image can be 10 MB."
                                );
                                return false;
                              } else {
                                setFile(file);
                              }
                              return true;
                            }}
                            id="file"
                            accept="image/jpeg,image/png"
                            name="fileToUpload"
                            type="file"
                            max="10485760"
                          />
                          <button type="button" className={styles.button}>
                            Upload a Photo
                          </button>
                        </label>
                      </View>
                    )}
                  </View>

                  <View
                    style={{
                      marginTop: 25,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ marginRight: 20 }}>
                      <span>
                        {valueSwitch ? "Allow" : "Not allow"} Comments
                      </span>
                    </View>
                    <Switch
                      checked={valueSwitch}
                      onChange={() => setSwitch((prev) => !prev)}
                      inputProps={{ "aria-label": "controlled" }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {file !== undefined && (
                    <div
                      style={{
                        flexDirection: "row",
                        display: "flex",
                        marginTop: "-31px",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <button
                        className={styles.button}
                        onClick={() => removeFile()}
                      >
                        Remove File
                      </button>
                    </div>
                  )}
                </View>
              </View>
            ) : (
              <>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 100,
                  }}
                >
                  <PostAddIcon style={{ fontSize: 60 }} />
                  <span
                    style={{
                      fontSize: 25,
                      marginTop: 30,
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    Creating Post...
                  </span>
                </View>
              </>
            )}
          </div>
        </Modal>
      </Suspense>
    </div>
  );
};

export default CreatePost;
