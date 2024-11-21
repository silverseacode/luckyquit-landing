"use client";
import { useState } from "react";
import styles from "../page.module.css";
import VideoFaqCoaches5 from "./VideoFaqCoaches5";
import VideoFaqCoaches4 from "./VideoFaqCoaches4";
import VideoFaqCoaches1 from "./VideoFaqCoaches1";
import VideoFaqQuitters4 from "./VideoFaqQuitters4";
import VideoFaqQuitters1 from "./VideoFaqQuitters1";

const AccordionItem = ({ title, content, id }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`accordion-item ${isOpen ? "active" : ""}`}>
      <div className="accordion-header" onClick={toggleAccordion}>
        <h3 className={styles.faqTitle}>{title}</h3>
        <span className="accordion-icon"></span>
      </div>
      {isOpen && (
        <>
          <div className="accordion-content">{content}</div>
        </>
      )}
    </div>
  );
};

export default AccordionItem;
