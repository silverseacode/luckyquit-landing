"use client";
import { useState } from "react";
import styles from "../../app/page.module.css";
import { Modal } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
const LegalComponent = () => {
  const [isOpen, setOpen] = useState(false);
  const [nameModal, setOpenModal] = useState("");
  return (
    <>
      <div>
        <h4
          onClick={() => {
            setOpenModal("terms");
            setOpen(true);
          }}
          className={styles.textFooter}
        >
          Terms of Service
        </h4>
        <h4
          onClick={() => {
            setOpenModal("privacy");
            setOpen(true);
          }}
          className={styles.textFooter}
          style={{marginBottom:5}}
        >
          Privacy Policy
        </h4>
        <span className={styles.contactUsMobile} style={{ color: "#FFF", fontWeight: "600", fontSize: 9 }}>lucky.quit.app@gmail.com</span>
      </div>
      <Modal
        className={styles.modal}
        open={isOpen}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className={styles.containerModal}>
          <div onClick={() => setOpen(false)}>
          <CloseIcon style={{fontSize: 30}} />
          </div>
          {nameModal === "terms" ? (
            <>
              <h2>Terms of Service</h2>

              <p>
                {" "}
                Welcome to the Quit Smoking App ("Lucky Quit"). By using the App
                or the web, you agree to the following terms and conditions:
              </p>

              <p>Payment Process:</p>
              <p>
                {" "}
                1.1. Users of the App or the web can make one-time payments to
                coaches for their services through PayPal.
              </p>
              <p>
                1.2. The payment amount and duration of the coaching plan are
                determined by the coach.
              </p>
              <p>
                1.3. Lucky Quit (the App) receives a 10% commission from each
                payment made to the coach.
              </p>
              <p>
                1.4. PayPal's terms and conditions apply to the payment process
                and any disputes related to payments should be resolved with
                PayPal directly.
              </p>

              <p>Coach Responsibilities:</p>
              <p>
                2.1. Coaches are responsible for setting the price and duration
                of their coaching plans.
              </p>
              <p>
                2.2. The coach is solely responsible for delivering the coaching
                services as agreed upon with the user.
              </p>
              <p>
                2.3. Lucky Quit (the App) does not guarantee the quality or
                effectiveness of the coaching services provided by the coach.
              </p>
              <p>
                2.4. If the coach fails to respect the agreed duration of the
                coaching plan or does not fulfill their obligations, the user
                should address the issue directly with the coach.
              </p>

              <p>Lucky Quit's Role:</p>
              <p>
                3.1. Lucky Quit (the App) acts as a platform to connect users
                with coaches and facilitate the payment process.
              </p>
              <p>
                3.2. Lucky Quit does not endorse or verify the qualifications or
                credentials of coaches.
              </p>
              <p>
                3.3. Lucky Quit is not responsible for any disputes, claims, or
                damages arising from the coaching services provided by the
                coach.
              </p>
              <p>
                3.4. Any issues or concerns related to the coaching services
                should be resolved directly between the user and the coach.
              </p>

              <p>Disclaimer:</p>
              <p>
                4.1. The information and content provided within the App or web
                are for educational and informational purposes only. They are
                not a substitute for professional medical advice or treatment.
              </p>
              <p>
                4.2. Users should consult with a healthcare professional before
                making any changes to their smoking habits or engaging in the
                coaching services offered through the App or web.
              </p>
            </>
          ) : (
            <>
              <h2>Privacy Policy</h2>

              <p>
                Thank you for using the Quit Smoking App (Lucky Quit). This
                Privacy Policy outlines how we collect, use, and protect your
                personal information. By using the App or the web, you agree to
                the terms of this Privacy Policy.
              </p>

              <p>Information We Collect:</p>
              <p>
                1.1. Personal Information: When you use the App or the web, we
                may collect certain personal information such as your name,
                email address, and payment details (handled securely by PayPal).
              </p>
              <p>
                1.2. Usage Information: We may collect information about your
                use of the App or the web, including your interactions,
                preferences, and activities.
              </p>

              <p>Use of Personal Information:</p>
              <p>2.1. We use your personal information to:</p>
              <p>- Facilitate the payment process between users and coaches.</p>
              <p>
                - Provide and improve the App's or web functionality and
                services.
              </p>
              <p>
                - Respond to your inquiries, requests, or customer support
                needs.
              </p>
              <p>
                - Analyze and monitor usage patterns to enhance user experience.
              </p>
              <p>
                2.2. We will not sell, rent, or disclose your personal
                information to third parties without your consent, except as
                required by law.
              </p>

              <p>Data Security:</p>
              <p>
                3.1. We implement industry-standard security measures to protect
                your personal information from unauthorized access, alteration,
                or disclosure.
              </p>
              <p>
                3.2. However, please note that no method of transmission over
                the internet or electronic storage is 100% secure. Therefore, we
                cannot guarantee absolute security of your information.
              </p>

              <p>Third-Party Services:</p>
              <p>
                4.1. The App or web may include links to third-party websites or
                services. These external sites are not governed by this Privacy
                Policy, and we are not responsible for their privacy practices.
                We encourage you to review the privacy policies of those
                third-party sites.
              </p>

              <p>Changes to Privacy Policy:</p>
              <p>
                5.1. We may update this Privacy Policy from time to time. Any
                changes will be posted on this page, and the effective date will
                be indicated at the top of the policy.
              </p>

              <p>Contact Us:</p>
              <p>
                6.1. If you have any questions, concerns, or requests regarding
                this Privacy Policy or your personal information, please contact
                us at lucky.quit.app@gmail.com.
              </p>

              <p>
                By using the Quit Smoking App or web, you consent to the
                collection, use, and processing of your personal information as
                described in this Privacy Policy.
              </p>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default LegalComponent;
