import React, { useState } from 'react';
import styles from './Calculator.module.css';

const Calculator = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNumber = (num) => {
    setDisplay(prev => prev === '0' ? num : prev + num);
    setEquation(prev => prev + num);
  };

  const handleOperator = (op) => {
    setDisplay('0');
    setEquation(prev => prev + ' ' + op + ' ');
  };

  const handleEqual = () => {
    try {
      // eslint-disable-next-line no-eval
      const result = eval(equation); 
      setDisplay(String(result));
      setEquation(String(result));
    } catch (error) {
      setDisplay('Error');
      setEquation('');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.calculator}>
        <div className={styles.header}>
          <h3>Calculator</h3>
          <button onClick={onClose} className={styles.closeBtn}>×</button>
        </div>
        
        <div className={styles.display}>
          <div className={styles.equation}>{equation}</div>
          <div className={styles.current}>{display}</div>
        </div>

        <div className={styles.keypad}>
          <button onClick={handleClear} className={`${styles.btn} ${styles.clear}`}>C</button>
          <button onClick={() => handleOperator('/')} className={`${styles.btn} ${styles.op}`}>÷</button>
          <button onClick={() => handleOperator('*')} className={`${styles.btn} ${styles.op}`}>×</button>
          <button onClick={() => handleOperator('-')} className={`${styles.btn} ${styles.op}`}>-</button>
          
          <button onClick={() => handleNumber('7')} className={styles.btn}>7</button>
          <button onClick={() => handleNumber('8')} className={styles.btn}>8</button>
          <button onClick={() => handleNumber('9')} className={styles.btn}>9</button>
          <button onClick={() => handleOperator('+')} className={`${styles.btn} ${styles.op}`}>+</button>
          
          <button onClick={() => handleNumber('4')} className={styles.btn}>4</button>
          <button onClick={() => handleNumber('5')} className={styles.btn}>5</button>
          <button onClick={() => handleNumber('6')} className={styles.btn}>6</button>
          <button onClick={handleEqual} className={`${styles.btn} ${styles.equal}`}>=</button>
          
          <button onClick={() => handleNumber('1')} className={styles.btn}>1</button>
          <button onClick={() => handleNumber('2')} className={styles.btn}>2</button>
          <button onClick={() => handleNumber('3')} className={styles.btn}>3</button>
          <button onClick={() => handleNumber('0')} className={`${styles.btn} ${styles.zero}`}>0</button>
          <button onClick={() => handleNumber('.')} className={styles.btn}>.</button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
