import AccordionItem from "./components/AccordionComponent";
import FeaturesComponent from "./components/FeaturesComponent";
import LegalComponent from "./components/LegalComponent";
import NavBarItems from "./components/NavbarItems";
import SphereComponent from "./components/SphereComponent";
import VideoLanding from "./components/VideoLanding";
import styles from "./page.module.css";
import Image from "next/image";

export default function Landing() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  return (
    <>
      <div className={styles.mainContainer}>
        <div className={styles.navbar}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: 220,
              alignItems: "center",
            }}
          >
            <Image
              width={60}
              height={60}
              alt="icon app"
              src={"/icon-of-the-app.png"}
              style={{cursor: 'pointer'}}
            />
            <span className={styles.brand} style={{ marginLeft: 5, fontWeight: "600", fontSize: 19, cursor: 'pointer' }}>
              Lucky Quit
            </span>
          </div>
          <NavBarItems />
        </div>
        <div className={styles.jumbotron}>
          <div className={styles.textLeft}>
            <div className={styles.mainText}>
              <h1>Embrace your Lucky Quit</h1>
              <h1>Empowering you to live smoke-free!</h1>
            </div>
            <div className={styles.secondText}>
              <p style={{ lineHeight: "1.5" }}>
                Unlock a healthier future and break free from smoking addiction
                with Lucky Quit – your comprehensive and personalized companion
                for a smoke-free life.
              </p>
            </div>
            <div className={styles.downloadButtons}>
              <img
                width={"230px"}
                height={75}
                alt="appstore"
                src={"/appstore.png"}
                style={{ cursor: "pointer" }}
                className={styles.headerAppIcons}
              />
              <img
                style={{ marginLeft: "30px", cursor: "pointer" }}
                width={"230px"}
                height={75}
                alt="playstore"
                src={"/playstore.png"}
                className={`${styles.headerAppIcons}`}
              />
            </div>
          </div>
          <div className={styles.imageMain}>
            {/* <Image
              width={800}
              height={800}
              className={styles.imagePhone}
              style={{ zIndex: 2, position: "relative" }}
              alt="hand holding phone"
              src={"/image-hand-money-picture.png"}
            /> */}
           <VideoLanding/>
             {/* <SphereComponent />  */}
          </div>
        </div>
        {/* Features section */}
        <div id="features-section" className={styles.featuresSection}>
          <h1 className={styles.titleSection}>Features</h1>
        </div>
        <FeaturesComponent />
        {/* are you a coach section */}
        <div id="coach-section" className={styles.coachSection}>
          <h1>Are you a Coach?</h1>
        </div>
        <div>
          <div className={styles.flexContainer}>
            <div className={styles.column}>
              <Image
                className={styles.iconCoachSection}
                src={"/icon-money-coach.png"}
                width={200}
                height={200}
                alt="icon money"
              />
              <p className={styles.textCoachSection}>
                Share your expertise and provide personalized guidance to
                empower others to break free from the habit and improve their
                well-being. Make a positive impact and earn money by helping
                people lead healthier lives.
              </p>
            </div>
            <div className={styles.column}>
              <img
                className={styles.iconCoachSection}
                src={"/icon-homework-coach.png"}
                width={200}
                height={200}
                alt="icon homework"
              />
              <p className={styles.textCoachSection}>
                As a Quit Smoking Coach, you will offer customized modules and
                exercises to individuals who are quitting smoking. These
                resources will be specifically designed to address their unique
                needs, challenges, and motivations.
              </p>
            </div>
            <div className={styles.column}>
              <Image
                className={styles.iconCoachSection}
                src={"/videocall-icon-coach.png"}
                width={200}
                height={200}
                alt="icon videocall"
              />
              <p className={styles.textCoachSection}>
                Facilitate direct and convenient communication between the Quit
                Smoking Coach and individuals through video calls and chat. This
                feature allows for real-time discussions, providing a personal
                touch to the coaching experience.
              </p>
            </div>
          </div>
        </div>
        <div id="faq-section" className={styles.faqSection}>
          <h1>FAQ For Quitters</h1>
        </div>
        <div className={styles.containerFaq}>
          <div className="accordion">
          <AccordionItem
              title="How does the tracking feature work?"
              content="Effortlessly log the time elapsed since your previous cigarette. Instantly calculate and showcase your financial dedication to your newfound freedom. Witness remarkable improvements in your health with each smoke-free milestone."
              id="faq-quitters-1"
            />
            <AccordionItem
              title="What can I do in the Communities section"
              content="The Communities section is similar to a social network where you can post your progress, your mood, or anything you'd like to share with fellow quitters like yourself, all in an effort to support each other in quitting smoking. You can follow others and have private chats through messaging. Here, you'll also find coaches who offer their services."
            />
            <AccordionItem
              title="Is the app free to use?"
              content="Currently, the app is free to use. You can enjoy features such as tracking your cigarette consumption, maintaining a history of smoked cigarettes with dates and locations, viewing health and expense statistics, and engaging with the community by sharing posts and connecting with other quitters. Additionally, you have the option to seek guidance from coaches to receive extra support in your journey to quit smoking."
            />
            <AccordionItem
              title="Are the services provided by coaches free of charge?"
              content="Coaches offer their services for a fee, and the pricing is determined by each individual coach. Additionally, there is a charge of 10% imposed by the app. Once you've paid for the service, you'll be connected through a plan, granting you access to the coach's modules and exercises. This plan also allows you to engage in conversations with the coach through both chat and video calls. This connection remains active for the duration of the plan you've chosen.
              "
            />
            <AccordionItem
              title="How do I pay the coach through the app?"
              content="Payments must be made exclusively through the app. The coach will send you a payment link with the specified amount, plan expiration date, and the additional app charge. After verifying the details, you can proceed to make the payment through PayPal, either using your own PayPal account or a credit card."
              id="faq-quitters-4"
            />
            <AccordionItem
              title="How do I view the modules and exercises sent by the coach?"
              content="You can access the modules and exercises in the app under the 'Home' section of the 'Communities,' by tapping the 'Homework' button beside the chat button. On the website, you can also view the modules and exercises. Keep in mind that they will only appear when the coach has submitted the Modules and Exercises ready for you. It's also important to note that you'll have access to them as long as you're within the plan's duration. When the coach sends them to you, you'll receive a notification."
            />
            <AccordionItem
              title="How do I communicate with my coach?"
              content="You can communicate with your coach through the chat feature available on both the app and the website. Additionally, coaches can schedule video calls, which will take place exclusively on the website through a computer. These scheduled calls will be recorded in your calendar for your convenience."
            />
          </div>
        </div>

        <div id="faq-section" className={styles.faqSection}>
          <h1>FAQ For Coaches</h1>
        </div>
        <div className={styles.containerFaq}>
          <div className="accordion">
            <AccordionItem
              title="How can I start earning money as a Coach?"
              content="Start connecting with individuals who are looking to quit in the community section of the app."
              id="faq-coaches-1"
            />
            <AccordionItem
              title="How do I send a payment link?"
              content="In the chat with a quitter, there is a button that says Configure Payment Link, where you can customize the payment as you like."
            />
            <AccordionItem
              title="How do I receive the payment?"
              content="To receive payments, you'll need a verified PayPal account associated with your email. In the Communities tab, when prompted, please enter your PayPal email. Additionally, at the moment you're sending the link, you can also update the email to ensure it's correct. Furthermore, you have the option to modify it later in the Settings screen, accessible by tapping the gear icon on the app's homepage. If you're using the web version, you can also make changes in your profile.
              "
            />
            <AccordionItem
              title="How much can I earn?"
              content="When sending the payment link, you have the flexibility to set the amount you want and the expiration date for the plan you're selling. The quitter will receive a payment link with the specified amount and a 10% fee, which goes to the Lucky Quit app. This information is clearly explained in the payment link that will be sent to the quitter."
              id="faq-coaches-4"
            />
            <AccordionItem
              title="How can I create modules and exercises for the quitter?"
              content="Creating modules and exercises for the quitter is a seamless process. While it's possible to create them both in the app and on the website, it's often more convenient to develop them on the website. Additionally, you'll find that refining the format and enhancing the content is more accessible from the web interface, especially when using a computer."
              id="faq-coaches-5"
            />
            <AccordionItem
              title="How can I schedule and conduct video calls with my quitter?"
              content="Our platform offers the capability for coaches and quitters to engage in video calls whenever they're connected through a plan. These calls can be initiated exclusively on the website, accessible from a computer. To schedule a video call, coaches have a dedicated button in the chat interface, located next to the payment link button. Once the call is scheduled, it's automatically recorded in the calendar, visible to both the coach and the quitter.
              "
            />
          </div>
        </div>

        <div className={`${styles.footerNotDesktop}`}>
          <div className={styles.flexContainerFooter}>
            <div className={styles.columnFooter}>
              <h3
                className={styles.legal}
                style={{ color: "#FFF", fontWeight: "600" }}
              >
                Legal Notice
              </h3>
              <LegalComponent />
            </div>
            <div className={styles.columnFooter}>
              <h1
                className={styles.lucky}
                style={{ color: "#FFF", fontWeight: "600" }}
              >
                Lucky Quit
              </h1>

              <div className={styles.social}>
                <a
                  href="https://www.facebook.com/app.lucky.quit"
                  className={styles.socialButton}
                >
                  <img
                    width={25}
                    height={25}
                    src={"/facebook-logo.png"}
                    style={{ cursor: "pointer" }}
                  />
                </a>
                <a
                  href="https://twitter.com/lucky_quit_app"
                  className={styles.socialButton}
                >
                  <img
                    width={25}
                    height={25}
                    src={"/twitter-logo.png"}
                    style={{ cursor: "pointer" }}
                  />
                </a>
                <a
                  href="https://www.instagram.com/lucky_quit/"
                  className={styles.socialButton}
                >
                  <img
                    width={25}
                    height={25}
                    src={"/instagram-logo.png"}
                    style={{ cursor: "pointer" }}
                  />
                </a>
                <a
                  href="https://www.threads.net/@lucky_quit"
                  className={styles.socialButton}
                >
                  <img
                    width={25}
                    height={25}
                    src={"/threads-logo.png"}
                    style={{ cursor: "pointer" }}
                  />
                </a>
              </div>

              <h5
                className={styles.rights}
                style={{ color: "#FFF", fontWeight: "600" }}
              >
                © {currentYear} - All rights reserved
              </h5>
            </div>
            <div className={`${styles.columnFooter} ${styles.getTheApp}`}>
              <h3 style={{ color: "#FFF", fontWeight: "600" }}>Contact Us</h3>
              <h5 style={{ color: "#FFF", fontWeight: "600" }}>lucky.quit.app@gmail.com</h5>
            </div>
          </div>
          <div className={styles.downloadButtonsMobile}>
            <img
              width={"150px"}
              height={45}
              alt="appstore"
              src={"/appstore.png"}
              style={{ cursor: "pointer" }}
              className={styles.appIconFooter}
            />
            <img
              style={{ marginLeft: "30px", cursor: "pointer" }}
              width={"150px"}
              height={45}
              alt="playstore"
              src={"/playstore.png"}
              className={styles.appIconFooter}
            />
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <div className={styles.flexContainerFooter}>
          <div className={styles.columnFooter}>
            <h3 style={{ color: "#FFF", fontWeight: "600" }}>Legal Notice</h3>
            <LegalComponent />
          </div>
          <div className={`${styles.columnFooter} ${styles.luckyBrand}`}>
            <h1 style={{ color: "#FFF", fontWeight: "600" }}>Lucky Quit</h1>

            <div className={styles.social}>
              <a
                href="https://www.facebook.com/app.lucky.quit"
                className={styles.socialButton}
              >
                <img
                  width={25}
                  height={25}
                  src={"/facebook-logo.png"}
                  style={{ cursor: "pointer" }}
                  className={styles.socialButtonImage}
                />
              </a>
              <a
                href="https://twitter.com/lucky_quit_app"
                className={styles.socialButton}
              >
                <img
                  width={25}
                  height={25}
                  src={"/twitter-logo.png"}
                  style={{ cursor: "pointer" }}
                  className={styles.socialButtonImage}
                />
              </a>
              <a
                href="https://www.instagram.com/lucky_quit/"
                className={styles.socialButton}
              >
                <img
                  width={25}
                  height={25}
                  src={"/instagram-logo.png"}
                  style={{ cursor: "pointer" }}
                  className={styles.socialButtonImage}
                />
              </a>
              <a
                href="https://www.threads.net/@lucky_quit"
                className={styles.socialButton}
              >
                <img
                  width={25}
                  height={25}
                  src={"/threads-logo.png"}
                  style={{ cursor: "pointer" }}
                  className={styles.socialButtonImage}
                />
              </a>
            </div>

            <h5
              className={styles.rights}
              style={{ color: "#FFF", fontWeight: "600" }}
            >
              © {currentYear} - All rights reserved
            </h5>
          </div>
          <div className={`${styles.columnFooter} ${styles.getTheApp}`}>
            <h3 style={{ color: "#FFF", fontWeight: "600" }}>Contact Us</h3>
             <h5 style={{ color: "#FFF", fontWeight: "600" }}>lucky.quit.app@gmail.com</h5>
          </div>
          <div className={styles.downloadButtonsMobile}>
            <img
              width={"150px"}
              height={45}
              alt="appstore"
              src={"/appstore.png"}
              style={{ cursor: "pointer" }}
              className={styles.appIconFooter}
            />
            <img
              style={{ marginLeft: "30px", cursor: "pointer" }}
              width={"150px"}
              height={45}
              alt="playstore"
              src={"/playstore.png"}
              className={styles.appIconFooter}
            />
          </div>
        </div>
      </div>
    </>
  );
}
