import React from 'react';
import ReactSpeedometer from 'react-d3-speedometer';

const Speedometer = ({ value }) => {
  return (
    <div style={{
      background: 'white',
      color: 'black',
      padding: '20px',
      borderRadius: '20px',
      width: '300px',
      height: '300px',
      textAlign: 'center',
    }}>
      <h4>Risk Score</h4>
      <ReactSpeedometer
        value={value}
        minValue={0}
        maxValue={1000}
        segments={5}
        startColor="rgba(221, 221, 238, 1)"
        endColor="rgb(37, 37, 93)"
        needleColor="black"
        ringWidth={30}
        textColor="black"
        currentValueText="Score: ${value}"
        height={200}
      />
      <div style={{
        backgroundColor: 'rgb(28, 28, 79)',
        padding: '5px 10px',
        borderRadius: '20px',
        fontWeight: 'bold',
        marginTop: '10px',
        color:'white'
      }}>
        High
      </div>
    </div>
  );
};

export default Speedometer;
