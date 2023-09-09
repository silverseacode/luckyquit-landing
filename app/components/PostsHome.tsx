"use client";

import styles from "./posts-home.module.css";
import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import React, { useMemo } from "react";
import CardPost from "./CardPost";
import { useEffect, useState } from "react";
import _ from "lodash";
import { Post, User } from "@/models";
import {
  addLike,
  deletePostBE,
  getAllPosts,
  removeLike,
} from "@/helpers/posts";
import {
  sendNotification,
  sendPushNotification,
  sendPushNotificationAndroid,
} from "@/helpers/notifications";
import ModulesAndExercises from "./ModulesAndExercisesScreen";
import { getUser } from "@/helpers/users";
import { getMeetingsBE } from "@/helpers/meetings";
import { Container } from "@mui/material";
import Homework from "./Homework";
import { useSocket } from "../Context/store";
import { getFollowersBE } from "@/helpers/followers";

const now = new Date();

interface IProps {
  setShowCalendar: (value: boolean) => void;
  setShowModules: (value: boolean) => void;
  setShowHomework: (value: boolean) => void;
  showCalendar: boolean;
  showHomework: boolean;
  showModules: boolean;
  newPostAdded: Post | undefined;
  user: User | undefined;
  posts: { totalPages: number; response: { posts: Post[] } };
  isChangesWithoutSave: boolean;
  setChangesWithoutSave: (value: boolean) => void;
  showModal: boolean;
  setShowModal: (value: boolean) => void;
}

const PostsHome = ({
  setShowCalendar,
  showCalendar,
  setShowModules,
  setShowHomework,
  showHomework,
  showModules,
  newPostAdded,
  user,
  posts,
  isChangesWithoutSave,
  setChangesWithoutSave,
  setShowModal,
  showModal,
}: IProps) => {
  const socket = useSocket();
  const [userType, setUserType] = useState("coach");
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    setIsLoading(true);

    async function getMeetings() {
      const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : "";
      const user = await getUser(UUID);
      const userDB = user.response[0];
      const type = user.response[0]?.type;
      setUserType(type);
      let meetingsData;

      meetingsData = await getMeetingsBE(UUID);
      const newData = meetingsData?.response.meetings.map((item: any) => {
        const newObject = {
          id: item._id,
          title: item.shortDescription,
          start:
            type === "coach"
              ? moment(item.meetDateCoachTimezone).toDate()
              : moment(item.meetDateQuitterTimezone).toDate(),
          end:
            type === "coach"
              ? moment(item.meetDateCoachTimezone).toDate()
              : moment(item.meetDateQuitterTimezone).toDate(),
        };
        return newObject;
      });

      let plansDates = [];
      if (type === "coach") {
        plansDates = userDB?.quitters.map(
          (
            item: {
              planStart: string;
              planEnd: string;
              fullName: string;
            },
            index: number
          ) => {
            const newObject = {
              id: index,
              title: `Active plan with ${item.fullName}`,
              start: moment(item.planStart).toDate(),
              end: moment(item.planEnd).add("1", "day").toDate(),
            };
            return newObject;
          }
        );
      } else {
        plansDates = userDB?.coaches.map(
          (
            item: {
              planStart: string;
              planEnd: string;
              fullName: string;
            },
            index: number
          ) => {
            const newObject = {
              id: index,
              title: `Active plan with ${item.fullName}`,
              start: moment(item.planStart).toDate(),
              end: moment(item.planEnd).add("1", "day").toDate(),
            };
            return newObject;
          }
        );
      }
      const events = newData?.concat(plansDates);
      console.log("events", events);
      setMeetings(events);
    }
    getMeetings();
  }, []);

  const mLocalizer = momentLocalizer(moment);

  const ColoredDateCellWrapper = ({ children }) =>
    React.cloneElement(React.Children.only(children), {
      style: {
        backgroundColor: "lightblue",
      },
    });

  const { components, defaultDate, views } = useMemo(
    () => ({
      components: {
        timeSlotWrapper: ColoredDateCellWrapper,
      },
      defaultDate: new Date(),
      //max: dates.add(dates.endOf(new Date(2015, 17, 1), 'day'), -1, 'hours'),
      //views: Object.keys(Views).map((k) => Views[k]),
    }),
    []
  );

  useEffect(() => {
    if (newPostAdded !== undefined) {
      let posts = _.cloneDeep(data);
      posts.unshift(newPostAdded);
      setData(posts);
    }
  }, [newPostAdded]);

  const [isChecked, setIsChecked] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Post[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  console.log("SHOWc", showHomework);
  useEffect(() => {
    async function fetchData() {
      if (user !== undefined) {
        if (page <= totalPages && isLoading) {
          const posts = await getAllPosts(page);
          console.log("111 ,posts", posts);
          if (posts !== undefined && posts.length !== 0) {
            setTotalPages(posts?.response.totalPages);
            const newData = [...data, ...posts.response.posts];

            const copyData1: Post[] = _.cloneDeep(newData);
            const copyData2: Post[] = _.cloneDeep(newData);
            const postsLucky = copyData1.filter((item) => {
              if (item.userId === "12345-lucky-12345") {
                return item;
              }
            });

            const postsWithoutLucky = copyData2.filter((item) => {
              if (item.userId !== "12345-lucky-12345") return item;
            });

            const today = new Date();
            if (
              user?.idsPostLucky !== undefined &&
              user?.idsPostLucky?.length > 0
            ) {
              const filteredPosts = postsLucky.filter((item) => {
                return !user?.idsPostLucky.some(
                  (post) => post._id === item._id
                );
              });

              filteredPosts.map((item) => {
                if (item.expirationDate !== undefined) {
                  const expirationDate = item.expirationDate;
                  const dateParts = expirationDate.split("/");
                  const year = parseInt(dateParts[2], 10);
                  const month = parseInt(dateParts[0], 10) - 1; // Months in JavaScript are zero-based
                  const day = parseInt(dateParts[1], 10);
                  const convertedDate = new Date(year, month, day);
                  if (convertedDate > today) {
                    //aca deberia poner id que va a ser el post completo
                    /// no solo el id
                    postsWithoutLucky.unshift(item);
                  }
                } else {
                  postsWithoutLucky.unshift(item);
                }
              });
            } else {
              postsLucky.map((item) => {
                if (item.expirationDate !== undefined) {
                  const expirationDate = item.expirationDate;
                  const dateParts = expirationDate.split("/");
                  const year = parseInt(dateParts[2], 10);
                  const month = parseInt(dateParts[0], 10) - 1; // Months in JavaScript are zero-based
                  const day = parseInt(dateParts[1], 10);

                  const convertedDate = new Date(year, month, day);
                  if (convertedDate > today) {
                  }
                } else {
                  postsWithoutLucky.unshift(item);
                }
              });
            }

            setData(postsWithoutLucky);
            setIsLoading(false);
          }
        }
      }
    }

    fetchData();
  }, [page, user]);

  useEffect(() => {
    const handleScroll = (e: any) => {
      const scrollHeight = e.target.documentElement.scrollHeight;
      const currentHeight =
        e.target.documentElement.scrollTop + window.innerHeight;
      if (currentHeight + 1 >= scrollHeight) {
        setPage((prevPage) => {
          return prevPage + 1;
        });
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        profilePicture: value.like.pictureProfileAws,
      });
    } else {
      await addLike(copyData[value.index].idv4, {
        userName: value.like.userName,
        profilePicture: value.like.profilePictureAws,
      });
      if (value.userId !== user?.userId) {
        const currentDatetime = new Date();
        const options = { timeZone: user?.timezone[0] };
        const dateTimezone = currentDatetime.toLocaleString("en-US", options);

        const newNotification = {
          sender: user?.userId ?? "",
          receiver: value.userId,
          date: dateTimezone,
          profilePictureSender: value.like.profilePictureAws,
          body: `New like from @${value.like.userName} in your post`,
          type: "like",
          postId: value.postId,
          senderFullName: value.like.userName,
          initials: value.initials,
          backgroundColor: value.backgroundColor,
        };

        await sendNotification(newNotification);
        //if (value.isAllowLikesNotification) {
          if (value.os !== "android") {
            const data = {
              token: value.ownerPostToken,
              title: `New like on your post`,
              body: `@${value.like.fullName} liked your post`,
              data: { isFrom: "Likes", postId: value.postId },
            };
            await sendPushNotification(data);
          } else {
            const pushNotification = {
              title: `New like on your post`,
              body: `@${value.like.fullName} liked your post`,
              data: { isFrom: "Likes", postId: value.postId },
              token: value.ownerPostToken,
            };
            await sendPushNotificationAndroid(pushNotification);
          }
        //}
      }
      const dataSocket = {
        receiver: user?.userId,
      };

      socket?.emit("send_notification_request", dataSocket);
    }
  };

  const deletePost = async (postId: number) => {
    let dataCopy = _.cloneDeep(data);
    dataCopy = dataCopy.filter((post) => post.idv4 !== postId);
    setData(dataCopy);
    await deletePostBE(postId);
  };

  const [followers, setFollowers] = useState([]);
  useEffect(() => {
    async function getFollowers() {
      const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : "";

      const data = await getFollowersBE(UUID);

      setFollowers(data.response.users);
    }
    getFollowers();
  }, []);

  const deletePostLuckyLocal = (id: string) => {
    let dataCopy: Post[] = _.cloneDeep(data);
    dataCopy = dataCopy.filter((post) => String(post._id) !== id);
    setData(dataCopy);
  };

  return (
    <div className={styles.container}>
      {showCalendar && (
        <div style={{ marginTop: -20 }}>
          <button
            className={styles.button}
            onClick={() => {
              setShowModules(false);
              setShowCalendar(false);
            }}
          >
            Back To Posts
          </button>
          <div className="height600">
            <Calendar
              components={components}
              defaultDate={defaultDate}
              events={meetings}
              localizer={mLocalizer}
              //max={max}
              showMultiDayTimes
              step={60}
              views={views}
            />
          </div>
        </div>
      )}
      {showModules && (
        <div>
          <ModulesAndExercises
            showModal={showModal}
            setShowModal={setShowModal}
            setChangesWithoutSave={setChangesWithoutSave}
            isChangesWithoutSave={isChangesWithoutSave}
            setShowModules={setShowModules}
            user={user}
          />
        </div>
      )}

      {showHomework && <Homework />}

      {!showCalendar && !showModules && !showHomework && (
        <div style={{ paddingTop: 2, paddingBottom: 10 }}>
          <Container maxWidth={"sm"}>
            {data.map((item, index) => (
              <CardPost
                key={index}
                //usersRecommendation={usersRecommendation}
                sendLikeUpdated={sendLikeUpdated}
                index={index}
                post={item}
                isChecked={isChecked}
                //timezone={timezone}
                deletePost={deletePost}
                user={user}
                followers={followers}
                socket={socket}
                deletePostLuckyLocal={deletePostLuckyLocal}
              />
            ))}
            {isLoading && (
              <div className={styles.spinnerOverlay}>
                <div className={styles.spinnerContainer}></div>
              </div>
            )}
          </Container>
        </div>
      )}
    </div>
  );
};

export default PostsHome;
