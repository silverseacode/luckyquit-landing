"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const FeaturesComponent = () => {
  const [isVisibleHome, setIsVisibleHome] = useState(false);
  const [isVisibleHealth, setIsVisibleHealth] = useState(false);
  const [isVisibleMoney, setIsVisibleMoney] = useState(false);
  const [isVisibleCommunities, setIsVisibleCommunities] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const sectionOffsetHome = document.getElementById("home").offsetTop; // Replace 'section-id' with the actual ID of the section
      if (scrollY > sectionOffsetHome - 1000) {
        setIsVisibleHome(true);
      }

      const sectionOffsetHealth = document.getElementById("health").offsetTop; // Replace 'section-id' with the actual ID of the section
      if (scrollY > sectionOffsetHealth - 500) {
        setIsVisibleHealth(true);
      }

      const sectionOffsetMoney = document.getElementById("money").offsetTop; // Replace 'section-id' with the actual ID of the section
      if (scrollY > sectionOffsetMoney - 500) {
        setIsVisibleMoney(true);
      }

      const sectionOffsetCommunities =
        document.getElementById("communities").offsetTop; // Replace 'section-id' with the actual ID of the section
      if (scrollY > sectionOffsetCommunities - 1000) {
        setIsVisibleCommunities(true);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div id="features">
      <div id="home" className="feature-first">
        <div className="static-text">
          <h2>Home</h2>
          <p className="text-feature">
          In the 'Home' section, you'll find a cigarette counter and a timer to track your smoke-free time. At the bottom, there's a timeline that logs your smoked cigarettes, including location and timestamp. This timeline allows you to filter by different parameters such as the current day, yesterday, or the entire week, offering insights into your smoking patterns and progress on your smoke-free journey.
          </p>
        </div>
        <div
          className={`animation-container ${isVisibleHome ? "animate" : ""}`}
        >
          <Image
            className="animation-image"
            src={"/icon-home.png"}
            width={200}
            height={200}
            alt="Animated Image"
          />
        </div>
      </div>

      <div id="health" className="feature">
        <div
          className={`animation-container-reverse ${
            isVisibleHealth ? "animate" : ""
          }`}
        >
          <Image
            className="animation-image animation-image-reverse"
            src={"/icon-health.png"}
            width={200}
            height={200}
            alt="Animated Image"
          />
        </div>
        <div className="static-text-reverse">
          <h2>Health</h2>
          <p className="text-feature">
          In the "Health" section, you can monitor the percentage improvements in various aspects of your health as you continue to stay smoke-free. These aspects include blood pressure, blood oxygen levels, nicotine levels in the blood, the risk of heart attack, and more.
          </p>
        </div>
      </div>

      <div id="money" className="feature">
        <div className="static-text">
          <h2>Money</h2>
          <p className="text-feature">
          Here, you can visualize your weekly cigarette expenses through Line and Pie graphs. Additionally, you'll have the ability to track your total spending for the month and overall duration.
          </p>
        </div>
        <div
          className={`animation-container ${isVisibleMoney ? "animate" : ""}`}
        >
          <Image
            className="animation-image"
            src={"/icon-money.png"}
            width={200}
            height={200}
            alt="Animated Image"
          />
        </div>
      </div>

      <div id="communities" className="feature">
        <div
          className={`animation-container-reverse ${
            isVisibleCommunities ? "animate" : ""
          }`}
        >
          <Image
            className="animation-image animation-image-reverse"
            src={"/icon-communities.png"}
            width={200}
            height={200}
            alt="Animated Image"
          />
        </div>
        <div className="static-text-reverse">
          <h2>Communities</h2>
          <p className="text-feature">
          Discover a dynamic 'Communities' section designed for both quitters and coaches. Connect with others who understand your journey, engage in private chats, and share your progress through posts. Find profiles of coaches and access their services directly in the app. For coaches, this section offers tailored tools to interact, share insights, and connect with potential clients.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeaturesComponent;
