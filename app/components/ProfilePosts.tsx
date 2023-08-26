import { useEffect, useState } from "react";
import { View } from "react-native";
import _ from "lodash";
import { Post, User } from "@/models";
import { addLike, deletePostBE, getPostsUserById, removeLike } from "@/helpers/posts";
import { Colors } from "@/app/colors";
import CardPost  from "./CardPost";
import { DatabaseOutlined } from "@ant-design/icons";
import { Container } from "@mui/material";
import { sendPushNotification, sendPushNotificationAndroid } from "@/helpers/notifications";

interface IProps {
  user: User;
}

const ProfilePosts = ({ user }: IProps) => {
  const [data, setData] = useState<Post[]>([]);
  useEffect(() => {
    async function getPostProfile() {
      if (user !== undefined) {
        const data = await getPostsUserById(user?.userId);
        setData(data.response.posts);
      }
    }

    getPostProfile();
  }, [user]);
  const [isChecked, setIsChecked] = useState(false);

  const sendLikeUpdated = async (value: any) => {
    const copyData = _.cloneDeep(data);
    const indexLike = copyData[value.index].likes.findIndex(
      (item, index) => item.userName === value.like.userName
    );
    if (indexLike !== -1) {
      copyData[value.index].likes = copyData[value.index].likes.filter(
        (item, index) => item.userName !== value.like.userName
      );
    } else {
      copyData[value.index].likes.push(value.like);
    }
    setData(copyData);
    if (indexLike !== -1) {
      await removeLike(copyData[value.index].idv4, {
        userName: value.like.userName,
        profilePicture: value.like.pictureProfile,
      });
    } else {
      await addLike(copyData[value.index].idv4, {
        userName: value.like.userName,
        profilePicture: value.like.profilePicture,
      });
      if (value.isAllowLikesNotification) {
        if (value.os !== "android") {
          const data = {
            token: value.ownerPostToken,
            title: `New like on your post`,
            body: `@${value.like.userName} liked your post`,
            data: { isFrom: "Likes", postId: value.postId },
          };
          await sendPushNotification(data);
        } else {
          const pushNotification = {
            title: `New like on your post`,
            body: `@${value.like.userName} liked your post`,
            data: { isFrom: "Likes", postId: value.postId },
            token: value.ownerPostToken,
          };
          await sendPushNotificationAndroid(pushNotification);
        }
      }
    }
  };
  const deletePost = async (postId: string) => {
    let dataCopy:Post[] = _.cloneDeep(data);
    dataCopy = dataCopy.filter((post) => post.idv4 !== postId);
    setData(dataCopy);
    await deletePostBE(postId);
  };
  return (
    <>
      <View
        style={{
          marginLeft: 45,
          marginTop: 20,
          marginBottom: -20,
        }}
      >
        <span style={{ color: Colors.blackCardDarkMode, fontSize: 25 }}>
          Posts
        </span>
      </View>
      <Container maxWidth={"sm"}>
        <View>
          {data.map((post, index) => {
            return (
              <CardPost
                key={index}
                isFromProfile={true}
                post={post}
                index={index}
                sendLikeUpdated={sendLikeUpdated}
                isChecked
                deletePost={deletePost}
                user={user}
                timezone={user.timezone[0]}
              />
            );
          })}
          {data.length === 0 && (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: 70,
              }}
            >
              <DatabaseOutlined style={{ fontSize: 40 }} />
              <span
                style={{ fontSize: 20, marginTop: 20 }}
              >{`${user?.firstName} ${user?.lastName} has not posted anything.`}</span>
            </View>
          )}
        </View>
      </Container>
    </>
  );
};

export default ProfilePosts