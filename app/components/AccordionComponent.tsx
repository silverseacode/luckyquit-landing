"use client"
import { useState } from "react";
import styles from "../page.module.css";

const AccordionItem = ({ title, content }: any) => {
    const [isOpen, setIsOpen] = useState(false);
  
    const toggleAccordion = () => {
      setIsOpen(!isOpen);
    };
  
    return (
      <div className={`accordion-item ${isOpen ? 'active' : ''}`}>
        <div className="accordion-header" onClick={toggleAccordion}>
          <h3 className={styles.faqTitle}>{title}</h3>
          <span className="accordion-icon"></span>
        </div>
        {isOpen && <div className="accordion-content">{content}</div>}
      </div>
    );
  };

  export default AccordionItem