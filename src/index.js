import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//Material-ui imports
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import Snackbar from '@material-ui/core/Snackbar';
import TextField from '@material-ui/core/TextField';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import MuiAlert from "@material-ui/lab/Alert";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import { styled } from '@material-ui/core/styles';
//Data
import timeslotsData from './timeslots-data'; //Options for Time Slots in an array
import periodData from './period-data'; //Types of period for Frequency in an array

const HBPopover = styled(Popover)({
  margin: '30px',
  opacity: 0.85,
});

const HBButton = styled(Button)({
  margin: '30px',
});

const HBTextField = styled(TextField)({
  margin: '30px',
});

const HBGrid = styled(Grid)({
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

function TimeslotButton(props) {
  return (
    <ToggleButton
      value={props.value}
      selected={props.selected}
      onChange={() => props.onChange()}
    >
      {timeslotsData[props.value]}
    </ToggleButton>
  );
}

//This component renders the list of Time Slot options that the user can select
class Timeslots extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeslots: Array(timeslotsData.length).fill(false) // Default all to be unselected
    }
  }

  //Handler for selection of toggle buttons
  handleSelection(newOption) {
    const timeslots = this.state.timeslots.slice();
    timeslots[newOption] = !timeslots[newOption];
    this.setState({ timeslots: timeslots });
  }

  render() {
    return (
      <Grid container spacing={2}>
        {timeslotsData.map((value, index) => (
          <Grid item xs={3}>
            <TimeslotButton
              value={index}
              selected={this.state.timeslots[index]}
              onChange={() => this.handleSelection(index)} />
          </Grid>
        ))}
      </Grid>
    );
  }
}

/*
Displays the frequency selection view in the form of a number input on the left
and a drop down selection for time period on the right.
*/
class FrequencyInput extends React.Component {
  constructor() {
    super();
    this.state = {
      freq: 1,
      period: 0,
    }
  }

  setFreq(newFreq) {
    this.setState({ freq: newFreq });
  }

  setPeriod(newPeriod) {
    this.setState({ period: newPeriod });
  }

  render() {
    return (
      <Grid container justify='space-between' spacing={2}>
        <Grid item xs={4}>
          <HBTextField
            id='freq'
            variant='outlined'
            type='number'
            required='true'
            value={this.state.freq}
            onChange={(e) => this.setFreq(e.target.value)}
          />
        </Grid>
        <HBGrid item xs={4}>
          <Container>
            time(s) a
          </Container>
        </HBGrid>
        <Grid item xs={4}>
          <HBTextField
            id='period'
            select
            variant='outlined'
            value={this.state.period}
            onChange={(e) => this.setPeriod(e.target.value)}>
            {periodData.map((value, index) => (
              <MenuItem key={index} value={index}>
                {value}
              </MenuItem>))}
          </HBTextField>
        </Grid>
      </Grid>
    );
  }
}

//Overall app display
class Schedule extends React.Component {
  constructor() {
    super();
    this.TimeslotsRef = React.createRef();
    this.FrequencyRef = React.createRef();
    this.state = {
      selectedSchedule: null, //keep track of whether time slots or frequency selected
      selectedTimeslots: [],  //stores all the time slots selected by the user
      savedSchedule: null,    //keep track of which schedule has been saved
      showTimeslots: null,    //flag to determine whether to show time slots selection view
      anchorEl: null,         //flag to determine whether to show frequency selection view
      openSnackBar: false,    //flag to control opening and closing of snackbar
      severity: '',           //severity of snackbar message
      message: '',            //message to be displayed to user
      saved: false,           //whether a schedule has been saved before
      freq: null,             //frequency entered by user
      period: null,           //time period selected by user
    }
  }

  //Handler for selection of schedule between time slots or frequency
  handleScheduleChange(newOption) {
    if (newOption == 'timeslots')
      this.setState({
        selectedSchedule: newOption,
        showTimeslots: true,
      });
    else
      this.setState({ selectedSchedule: newOption });
  }

  //Opening of frequency selection view
  handleFreqOpen(target) {
    this.setState({
      selectedSchedule: target.value,
      anchorEl: target,
    });
  }

  //Closing of frequency selection view
  handleFreqClose() {
    this.setState({
      selectedSchedule: null,
      anchorEl: null,
      showTimeslots: false,
    });
  }

  handleSnackBarClose() {
    this.setState({ openSnackBar: false });
  }

  /*
  Saves the timeslots selected by the user.
  Also tracks whether the save was successful and sets the message to be displayed
  accordingly
  */
  saveTimeslotsSelected() {
    //Retrieving the selected timeslots via the child object's state
    const currTimeslots = this.TimeslotsRef.current.state.timeslots;
    var selTimeslots = [];
    for (let i = 0; i < currTimeslots.length; i++) {
      if (currTimeslots[i])
        selTimeslots.push(i);
    }
    if (selTimeslots.length < 1) {
      this.setState({
        openSnackBar: true,
        severity: 'error',
        message: 'Unable to save schedule, please select at least 1 option',
      });
    }
    else {
      this.setState({
        selectedSchedule: null,
        savedSchedule: 'timeslots',
        openSnackBar: true,
        selectedTimeslots: selTimeslots,
        showTimeslots: false,
        severity: 'success',
        message: 'Schedule saved',
      });
    }
  }

  /*
  Saves the frequency selected by the user.
  Also tracks whether the save was successful and sets the message to be displayed
  accordingly
  */
  saveFreq() {
    const freq = this.FrequencyRef.current.state.freq;
    const period = this.FrequencyRef.current.state.period;
    //User tried to save selection with null values
    if (freq == '' || freq == null) {
      this.setState({
        openSnackBar: true,
        severity: 'error',
        message: 'Unable to save schedule, please ensure a value is entered',
      });
    }
    //User tried to enter frequency < 1
    else if (freq < 1) {
      this.setState({
        openSnackBar: true,
        severity: 'error',
        message: 'Unable to save schedule, please ensure a valid value (bigger than 1) is entered',
      });
    }
    //Successful entry
    else {
      this.setState({
        selectedSchedule: null, //resets the selected schedule so the view resets
        savedSchedule: 'frequency',
        showTimeslots: false,
        openSnackBar: true,
        freq: freq,
        period: period,
        severity: 'success',
        message: 'Schedule saved',
      });
      //Close the frequency selection popover
      this.handleFreqClose();
    }
  }

  //Displays user's selection in a data window below the main component
  renderResults() {
    if (this.state.savedSchedule == 'timeslots') {
      const selectedSlots = this.state.selectedTimeslots;
      if (this.state.selectedTimeslots.length == 0)
        return null;
      else {
        return (
          <div>
            <Divider />
            You have saved the following time slots:
              <List dense='true'>
              {selectedSlots.map((value, index) => (
                <ListItem>
                  <ListItemText primary={timeslotsData[value]} />
                </ListItem>
              ))}
            </List>
          </div>
        );
      }
    }
    //Display frequency data
    else if (this.state.savedSchedule == 'frequency') {
      return (
        <div>
          <Divider />
          You have saved frequency of: {this.state.freq} time(s) a {periodData[this.state.period]}
        </div>
      );
    }
  }

  render() {
    //to control opening and closing of frequency popover
    const freqOpen = Boolean(this.state.anchorEl);
    const freqPopId = freqOpen ? 'simple-popover' : undefined;
    return (
      <Container maxWidth='sm'>
        <br />
        <div>Select Patient Self-Monitoring Schedule*</div>
        <br />
        <ToggleButtonGroup
          value={this.state.selectedSchedule}
          exclusive>
          <ToggleButton value='timeslots'
            onClick={e => this.handleScheduleChange(e.currentTarget.value)}>
            Time Slot
          </ToggleButton>
          <ToggleButton value='frequency'
            onClick={e => this.handleFreqOpen(e.currentTarget)}>
            Frequency
          </ToggleButton>
          <HBPopover
            id={freqPopId}
            open={freqOpen}
            anchorEl={this.state.anchorEl}
            onClose={() => this.handleFreqClose()}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}>
            {<FrequencyInput ref={this.FrequencyRef} />}
            <HBButton
              onClick={() => this.saveFreq()}
              color='primary'
              variant='contained'>
              Save
            </HBButton>
          </HBPopover>
        </ToggleButtonGroup>
        <br /><br />
        {this.state.showTimeslots ? <Timeslots ref={this.TimeslotsRef} /> : null}
        <br /><br />
        <div>
          <Button
            id='save-button'
            disabled={!(this.state.selectedSchedule == 'timeslots')}
            onClick={() => this.saveTimeslotsSelected()}
            color='primary'
            variant='contained'>
            Save
          </Button>
        </div>
        <br /><br /><br /><br />
        <div>{this.renderResults()}</div>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.state.openSnackBar}
          autoHideDuration={6000}
          onClose={() => this.handleSnackBarClose()}
          action={
            <React.Fragment>
              <IconButton size="small" color="inherit" onClick={(e) => this.handleSnackBarClose()}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={() => this.handleSnackBarClose()}
            severity={this.state.severity}>
            {this.state.message}
          </MuiAlert>
        </Snackbar>
      </Container>
    );
  }
}
ReactDOM.render(<Schedule />, document.getElementById("root"));
