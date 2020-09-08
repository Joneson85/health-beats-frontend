import React from 'react';
import ReactDOM from 'react-dom';
import Grid from '@material-ui/core/Grid';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import scheduleData from './schedule-data';

/*
  The app starts by calling this function which displays the overall form
  for the user to being interaction
*/
function RenderScheduleForm() {
  return (
    <div>
      <div>
        Select Patient Self-Monitoring Schedule*
      </div>
      <br />
      <RenderScheduleOptions />
    </div>
  );
}

//Render the types of schedules - Either by Time Slot or Frequency
function RenderScheduleOptions() {
  const [option, setOption] = React.useState('');
  //Set new option
  const handleScheduleChange = (event, newOption) => {
    setOption(newOption);
  };
  return (
    <div>
      <ToggleButtonGroup
        value={option}
        exclusive //Only one option can be active at any time
        onChange={handleScheduleChange}
      >
      <ToggleButton value="timeslots">
          By Time Slot
      </ToggleButton>
        <ToggleButton value="frequency">
          By Frequency
      </ToggleButton>
      </ToggleButtonGroup>
      <br />
      <br />
      {
        RenderSecondaryOptions(option)
      }
    </div>
  );
}

//Render the options for user to select based on type of schedule selected
function RenderSecondaryOptions(schedule) {
  if (schedule == 'timeslots') {
    return (
      <div>
        <div id="ts1"><RenderTimeslotOptionsNew /></div>
        <div id="ts2"><RenderTimeslotOptionsNew /></div>
      </div>
      
    
      

    );
  }
  else
    return (
      <div>
        {schedule}
      </div>
    );
}

function RenderTimeslotOptionsNew(){
  const [selected, setSelected] = React.useState(false);
  return (
    <ToggleButton
      value="check"
      selected={selected}
      onChange={() => {
        setSelected(!selected);
      }}
    >a
    </ToggleButton>
  );
}


function RenderTimeslotOptions() {
  const [timeslots, setTimeslot] = React.useState(() => []);
  const handleTimeslotChange = (event, newTimeslot) => {
    setTimeslot(newTimeslot);
  };
  return (
    <ToggleButtonGroup size="large" 
                       value={timeslots}
                       onChange={handleTimeslotChange}>
      <ToggleButton value="a" >
        a
      </ToggleButton>
      <ToggleButton value="b">
        b
      </ToggleButton>
      <ToggleButton value="c">
        c
        </ToggleButton>
      <ToggleButton value="d">
        d
      </ToggleButton>
    </ToggleButtonGroup >
  );
}

ReactDOM.render(<RenderScheduleForm />, document.getElementById("root"));
