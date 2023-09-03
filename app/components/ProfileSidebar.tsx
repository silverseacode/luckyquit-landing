"use client";

import { useEffect, useState } from "react";
import styles from "./profile-sidebar.module.css";
import { getRatingsBE, getUser } from "@/helpers/users";
import { User } from "@/models";
import { Colors } from "@/app/colors";
import StarIcon from "@mui/icons-material/Star";
import { View, Pressable } from "react-native";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import moment from "moment";
import { getModulesAndExercisesByQuitterUserId } from "@/helpers/modules";
interface IProps {
  user: User | undefined;
  setShowCalendar?: (value: boolean) => void;
  setShowModules?: (value: boolean) => void;
  setShowHomework?: (value: boolean) => void;
  showButtons: boolean;
  isLoading: boolean;
  isChangesWithoutSave: boolean;
  setShowModal: (value: boolean) => void;


}

const ProfileSidebar = ({
  user,
  setShowCalendar,
  setShowModules,
  setShowHomework,
  showButtons = true,
  isLoading,
  isChangesWithoutSave,
  setShowModal
}: IProps) => {
  console.log("USER", user);
  const router = useRouter();
  const [avg, setAvg] = useState(0);
  const [numberOfReviews, setNumberOfReviews] = useState(0);
  useEffect(() => {
    async function getRatings() {
      const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : false;
      const res = await getRatingsBE(UUID);
      const ratings = res?.response;
      let starsCount = 0;
      console.log(22, ratings);
      if (ratings?.length > 0) {
        setNumberOfReviews(ratings?.length);
        ratings?.map((item: { stars: number }) => {
          starsCount += item.stars;
        });
        const avg = Math.floor((starsCount / ratings?.length) * 100) / 100;
        setAvg(ratings?.response?.length === 0 ? 0 : avg);
      } else {
        setAvg(0);
        setNumberOfReviews(0);
      }
    }
    getRatings();
  }, []);

  const [hasHomework, setHasHomeWork] = useState(false);
  useEffect(() => {
    async function getHasHomeWork() {
      const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : "";
      const modules = await getModulesAndExercisesByQuitterUserId(UUID);
      let isReadyForQuitter = false;
      let coachUserId = "";
      if (modules?.response?.module.length > 0) {
        modules?.response?.module?.map(
          (item: { isReadyForQuitter: boolean; userId: string }) => {
            if (item.isReadyForQuitter) {
              isReadyForQuitter = true;
              coachUserId = item.userId;
            }
          }
        );

        const data = await getUser();
        const mySelf = data.response[0];
        let isPlanEndExpireLocal;
        let hasCoach = false;
        const today = new Date();

        if (mySelf?.coaches?.length > 0) {
          hasCoach = true;
          mySelf.coaches.map((coach: { userId: string; planEnd: string }) => {
            if (coachUserId === coach.userId) {
              const [month, day, year] = coach.planEnd.split("/").map(Number);
              const planEndDate = new Date(year, month - 1, day);
              isPlanEndExpireLocal = today > planEndDate;
            }
          });
        }

        if (isReadyForQuitter && !isPlanEndExpireLocal && hasCoach) {
          setHasHomeWork(true);
        } else {
          setHasHomeWork(false);
        }
      } else {
        setHasHomeWork(false);
      }
    }

    getHasHomeWork();
  }, []);
  console.log("user?.profilePicture", user?.profilePicture);
  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        {!isLoading ? (
          <>
            <Pressable
              onPress={() => router.push(`/profile/${user?.userId}/false`)}
            >
              {user?.profilePicture !== "" &&
              user?.profilePicture !== undefined ? (
                <div>
                  <Image
                    className={styles.imageProfile}
                    src={user?.profilePicture}
                    alt={"profile picture"}
                    height={70}
                    width={70}
                  />
                </div>
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
                  <span style={{ color: Colors.blackDefault, fontSize: 18 }}>
                    {user?.initials}
                  </span>
                </View>
              )}
            </Pressable>
            <div style={{ fontWeight: "600" }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div
              style={{
                marginTop: 10,
                color: Colors.darkGray,
                paddingBottom: 10,
              }}
            >
              {user?.descriptionAboutMe}
            </div>
          </>
        ) : (
          <div className={styles.spinnerOverlay}>
            <div className={styles.spinnerContainer}></div>
          </div>
        )}
      </div>
      {user?.type === "coach" && !isLoading && (
        <div className={styles.containerInfo}>
          <div
            style={{
              flexDirection: "row",
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
              paddingBottom: 10,
            }}
          >
            <div>Number of Reviews</div>
            <div>{numberOfReviews}</div>
          </div>

          <div className={styles.rating}>
            <div>Rate</div>
            <div
              style={{
                flexDirection: "row",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div style={{ marginRight: 5 }}>{avg.toFixed(1)}/5</div>
              <StarIcon style={{ color: "#FFD700", marginRight: -6 }} />
            </div>
          </div>
        </div>
      )}
      {showButtons && !isLoading && (
        <div className={styles.containerButtons}>
          <button
            className={styles.button}
            onClick={() => {
              if(isChangesWithoutSave) {
                setShowModal(true)
                return
              }
              setShowCalendar(true);
              setShowModules(false);
              setShowHomework(false);
            }}
          >
            Show Calendar
          </button>
          {hasHomework && (
            <button
              style={{ marginLeft: 20 }}
              className={styles.buttonModules}
              onClick={() => {
                setShowHomework?.(true);
              }}
            >
              Homework
            </button>
          )}
          {user?.type === "coach" && (
            <button
              className={styles.buttonModules}
              onClick={() => {
                if(isChangesWithoutSave) {
                  setShowModal(true)
                  return
                }
                setShowCalendar(false);
                setShowModules(true);
              }}
            >
              Create modules and exercises
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileSidebar;
