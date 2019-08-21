//MARK -TODO Remove the submit handler button from the date picker component

import React from 'react'
import "../css/Shifts.css"
import "../css/util.css"
import "../css/PostShiftPage.css"
import {Header} from "./WaitList";
import {getPositionsForUser, postShift} from "./DataFetchHandler";
import {getDaysInMonth, formatAMPM, IP} from "./Util";
import {getCookie} from "./Authentication";
import {Footer} from "./LandingPage";

/**
 * basic Date Picker that renders 3 HTML selections for the respected items (month,day, and year)
 * the date is a state managed object and any input event to the selections with result in a state change.
 * upon a state change the changes are also sent up to the parent component by forcing an onChange callback.
 */
export class DatePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            validDate: false,
            now: new Date(),
            date: new Date()
        };
        this.handleSelectionChange = this.handleSelectionChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    /**
     * Creates all the month options for one of HTML selections.
     * month selections are created with respect the given
     * year to avoid months that are in the past
     * @returns {Array} month options
     */
    months = () => {
        let ele = [];
        let i = () => {
            if (this.state.date.getFullYear() === this.state.now.getFullYear()) {
                return this.state.now.getMonth() + 1;
            }
            return 1;
        };
        for (let x = i(); x <= 12; x++) ele.push(<option key={x} value={x - 1} className={"month-option"}>{x}</option>);
        return ele
    };

    /**
     * Creates all the day options for for one of the HTML selections
     * @returns {Array} day options
     */
    days = () => {
        let ele = [];
        //const daysOfTheWeek = [" Sunday"," Monday"," Tuesday"," Wednesday"," Thursday"," Friday"," Saturday"];

        //Getting the correct day of the month to avoid days in the past
        let i = () => {
            if (this.state.date.getMonth() === this.state.now.getMonth()
                && this.state.date.getFullYear() === this.state.now.getFullYear()) {
                return this.state.now.getDate();
            }
            return 1;
        };
        let numDays = getDaysInMonth(this.state.date.getMonth() + 1, this.state.date.getFullYear());
        //let currentDay = this.state.date.getDay();

        //push formatted day options for the current month
        for (let x = i(); x <= numDays; x++) {
            //let output = [x.toString(),daysOfTheWeek[currentDay]].join();
            let output = x;
            ele.push(<option key={x} value={x} className={"day-option"}>{output}</option>);
            //currentDay === 6 ? currentDay=0 : currentDay++;
        }
        return ele;
    };

    /**
     * Creates all the year options for the HTML selection. Year options are only the current full year and that year + 1
     * @returns {Array} year options
     */
    years = () => {
        let curYear = this.state.now.getFullYear();
        let ele = [];
        for (let i = this.state.now.getFullYear(); i <= curYear + 1; i++) ele.push(<option key={i} value={i}
                                                                                           className={"year-option"}>{i}</option>);
        return ele;
    };

    /**
     * Handles all the callback input events on all the date selections.
     * The state is updated with respect to the target.
     * @param e input event object
     */
    handleSelectionChange = (e) => {
        let date = this.state.date;
        switch (e.target.id) {
            case "month-select":
                date.setMonth(e.target.value);
                break;
            case "day-select":
                date.setDate(e.target.value);
                break;
            case "year-select":
                date.setFullYear(e.target.value);
                break;
            default:
                return;
        }
        this.setState({date: date});

        e.persist();
        this.props.onChange({date: date, event: e});
    };
    handleSubmit = (e) => {

    };

    render() {
        return (
            //change to div submit inst used here
            <form id="datePickerCont" style={{marginLeft:0}} onSubmit={this.handleSubmit}>
                <select name={this.props.name} className={"dropdown-cont"} onChange={this.handleSelectionChange}
                        value={this.state.date.getMonth()} id={"month-select"}>
                    {this.months()}
                </select>
                <label id={"SelectionLabel"}>/</label>
                <select className={"dropdown-cont"} onChange={this.handleSelectionChange}
                        name={this.props.name} value={this.state.date.getDate()} id={"day-select"}>
                    {this.days()}
                </select>
                <label id={"SelectionLabel"}>/</label>
                <select className={"dropdown-cont"} onChange={this.handleSelectionChange}
                        name={this.props.name} value={this.state.date.getFullYear()} id={"year-select"}>
                    {this.years()}
                </select>
            </form>
        );
    }
}

/**
 * [TimePicker]
 *
 * Renders 2 selections for the shift start time and end time.
 * A index in military time is kept for both start and end times and are state managed
 * the time indexes sizes are used to convert the hours and mins and also when change updated a state change
 * is executed locally and set upward through the prop file pointer 'onChange'.
 */
class TimePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startTimeIndex: 0,
            endTimeIndex: 0,
        };
        this.handleTimeChange = this.handleTimeChange.bind(this);
    }

    /**
     * Takes the an index of time (the state)
     * @param index time index
     * @returns {{hours: number, min: number}}
     */
    timeIndexToMili = (index) => {
        return {hours: Math.floor((index - 1) / 2) | 0, min: index % 2 === 0 ? 30 : 0};
    };

    /**
     * Formats the time for displaying in the selections
     * @param hours int
     * @param min int
     * @returns {string} formatted time
     */
    formattedTime = (hours, min) => {
        let isAm = true;
        if (hours > 12) {
            hours = hours - 12;
            isAm = false;
        } else if (hours === 12)
            isAm = false;
        if (hours === 0) {
            hours = 12;
        }

        let output = hours + "";
        output = output.concat(":").concat(min);
        if (min === 0) {
            output = output.concat("0")
        }
        if (isAm) {
            output = output.concat(" AM");
        } else {
            output = output.concat(" PM");
        }
        return output;
    };

    //MARK Todo use the props key for the second time picker and then modify the list of options and add markings for times at are the next day.
    /**
     * returns all of the options for all of the times in the day
     * @returns {Array} select options array
     */
    renderOptions = () => {
        let elems = [];
        let {hours, min} = {hours: 0, min: 0};
        for (let i = 0; i < 48;) {
            if (i !== 0) {
                if (i % 2 === 0) {
                    hours += 1;
                    min = 0;
                } else if (min === 0) {
                    min = 30;
                } else if (min === 30) {
                    min = 0;
                }
            }
            i++;
            elems.push(<option value={i} key={i}>{this.formattedTime(hours, min)}</option>);
        }
        return elems;
    };

    /**
     * Input event handler used to manage the local state and the state of the parent component
     * @param e Input event object
     */
    handleTimeChange = (e) => {
        switch (e.target.id) {
            case "start-time":
                this.setState({startTimeIndex: e.target.value,});
                this.props.onChange({type: 0, time: this.timeIndexToMili(e.target.value)});
                break;
            case "end-time":
                this.setState({endTimeIndex: e.target.value,});
                this.props.onChange({type: 1, time: this.timeIndexToMili(e.target.value)});
                break;
            default:
                return;
        }

    };

    render() {
        return (
            <div>
                <select className={"dropdown-cont"} value={this.state.startTimeIndex} onChange={this.handleTimeChange}
                        id={"start-time"}>
                    {this.renderOptions()}
                </select>
                <label id={"SelectionLabel"}>to</label>
                <select className={"dropdown-cont"} value={this.state.endTimeIndex} onChange={this.handleTimeChange}
                        id={"end-time"}>
                    {this.renderOptions()}
                </select>
            </div>
        );
    }
}

/**
 * [Position Picker]
 *
 * Renders a list of radio buttons based on the size of the data in props.
 * The current selected radio button is managed with every input event on the radio buttons.
 * That change is reelected in the scope of the Component and outside the component (Parent).
 */
class PositionList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPos: null
        };
        this.handlePosChange = this.handlePosChange.bind(this);
    }

    /**
     * input event handler for tracking changes in the job position
     * The state is changed to the current job position id.
     * @param e input event object
     */
    handlePosChange = (e) => {
        this.setState({selectedPos: e.target.value});
        this.props.onChange(e.target.value);
    };

    /**
     * Returns a single job position for rendering
     * @param i index of the position
     * @returns {*} A single radio button
     */
    renderPosition = (i) => {
        return (
            <div key={i} className={"flexRow"}>
                <input id={"pos-checkbox"} type={"radio"} name="pos" value={this.props.data[i].id}/>
                <label id={"pos-label"}>{this.props.data[i].posName}</label>
            </div>
        );
    };

    render() {
        if (this.props.data) {
            return (
                <div onChange={this.handlePosChange}>
                    <h3>Shift Type</h3>
                    {this.props.data.map((obj, i) => {
                        return this.renderPosition(i);
                    })}
                </div>
            );
        } else {
            return (<h3>Fetching Shift Types...</h3>);
        }
    }
}

/**
 * Main outer parent and handler for all children component changes.
 */
export default class PostShiftPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: new Date(),
            endDate: new Date(),
            positionData: [],
            selectedPosition: null,
            overNightWarning: {status: false, message: ""},
            longShiftWarning: {status: false, message: ""},
            shiftInputFailure: {status: false, message: "", pointer: null},
            message: "",
            permShiftPosting: "off",
            confirmStatus: "untested",
        };

        this.handleDateChange = this.handleDateChange.bind(this);
        this.handlePosChange = this.handlePosChange.bind(this);
        this.handleTimeChange = this.handleTimeChange.bind(this);
        this.handlePermShiftChange = this.handlePermShiftChange.bind(this);
        this.handlePost = this.handlePost.bind(this);
        this.handleConfirmPost = this.handleConfirmPost.bind(this);
        this.handleUnConfirm = this.handleUnConfirm.bind(this);
        this.handleMessageChange = this.handleMessageChange.bind(this);
    }

    componentWillMount() {
        //Gather API data and set that data to the state.
        getPositionsForUser()
            .then(result => {
                this.setState({positionData: result['res']});
            })
            .catch(err => console.error('error', err.toString()));
    }

    //inner state change event handler
    handleDateChange = (e) => {
        e = e.date;
        //transfer over the time picker timestamps to the new selected dates
        e.setHours(this.state.date.getHours());
        e.setMinutes(this.state.date.getMinutes());
        let newEndDate = this.state.endDate;

        if (this.state.endDate.getDate() > this.state.date.getDate()) {
            newEndDate.setDate(e.getDate() + 1);
        } else {
            newEndDate.setDate(e.getDate());
        }
        newEndDate.setFullYear(e.getFullYear());
        newEndDate.setMonth(e.getMonth());
        this.setState({date: e});
        this.setState({endDate: newEndDate})
    };

    //inner state change event handler for setting
    //the end and start times for the time stamp
    handleTimeChange = (e) => {
        //copy state date object and avoid keeping obj reference
        let newDate = new Date(this.state.date.getTime());
        let newEndDate = new Date(this.state.endDate.getTime());

        let warnings = this.getShiftWarnings(e.type, e.time.hours);

        if (warnings.overNightWarning.status
            && this.state.date.getDate() === this.state.endDate.getDate()) {
            newEndDate.setDate(newEndDate.getDate() + 1);
        } else if (this.state.endDate.getDate() > this.state.date.getDate()) {
            newEndDate.setDate(newEndDate.getDate() - 1);
        }

        switch (e.type) {
            case 0:
                newDate.setHours(e.time.hours);
                newDate.setMinutes(e.time.min);
                this.setState({
                    date: newDate,
                    endDate: newEndDate,
                    overNightWarning: warnings.overNightWarning,
                    longShiftWarning: warnings.longShiftWarning
                });
                break;
            case 1:
                newEndDate.setHours(e.time.hours);
                newEndDate.setMinutes(e.time.min);
                this.setState({
                    endDate: newEndDate,
                    overNightWarning: warnings.overNightWarning,
                    longShiftWarning: warnings.longShiftWarning
                });
                break;
            default:
        }
    };

    /**
     * Generates Warning Messages for shift times and returns a warning object that contains both of the warnings.
     * @param inputType
     * @param currentHoursChange
     * @returns {{overNightWarning: {message: string, status: boolean}, longShiftWarning: {message: string, status: boolean}}}
     */
    getShiftWarnings = (inputType, currentHoursChange) => {
        let start = inputType === 0 ? currentHoursChange : this.state.date.getHours();
        let end = inputType === 1 ? currentHoursChange : this.state.endDate.getHours();
        let warnings = {longShiftWarning: {status: false, message: ""}, overNightWarning: {status: false, message: ""}};

        //-------overNightWarning
        if (end < start) {
            warnings.overNightWarning = {status: true, message: "[Warning]: This shift ends the next day"};
        }
        //-------longShiftWarning
        let shiftLength = 0;
        //check for a long shift and set a longShiftWarning
        if (warnings.overNightWarning.status) {
            shiftLength += 24 - start;
            shiftLength += end;
        } else {
            shiftLength = Math.abs(start - end);
        }
        //check and set a longShiftWarning
        if (shiftLength > 10) {
            warnings.longShiftWarning = {status: true, message: "[Warning]: This shift is " + shiftLength + " hours"};
        }

        return warnings;
    };

    getCorrectPosNameFromPosMapping = (selectedPos, positions) => {
        let shiftType = selectedPos;
        let shiftName = "Default";
        for (let i = 0; i < positions.length; i++) {
            console.log(typeof shiftType);
            if (Number(shiftType) === positions[i].id) {
                return positions[i].posName;
            }
        }
        return shiftName;
    };

    //inner state change event handler.
    handlePosChange = (e) => {
        let shiftInputFailure = this.state.shiftInputFailure;
        if (shiftInputFailure.status && shiftInputFailure.pointer === this.handlePosChange) {
            shiftInputFailure = {status: false, message: "", pointer: null,}
        }
        let {start, end} = {start: this.state.date, end: this.state.endDate};

        let correctName = this.getCorrectPosNameFromPosMapping(e, this.state.positionData);
        console.log(correctName);
        console.log(this.state.positionData);
        if (correctName === "Call-In") {
            start.setHours(17);
            start.setMinutes(0);
            end.setHours(22);
            end.setMinutes(0);
        }
        if (correctName === "Moblie") {
            start.setHours(18);
            start.setMinutes(45);
            end.setHours(22);
            end.setMinutes(0);
        }

        console.log("set state");
        this.setState({date: start, endDate: end, selectedPosition: e, shiftInputFailure: shiftInputFailure});
    };

    //state change event handler for the check box in the forum.
    handlePermShiftChange = (e) => {
        if (e.target.value === "on") {
            this.setState({permShiftPosting: "off"});
        } else
            this.setState({permShiftPosting: "on"});
    };

    //Sender for the post bottom in the forum. Validates the inputs and sets failure message if the input is invalid.
    //If input is correct then an post request is executed keeping record of the posting and the user is redirected to the shifts page.
    handlePost = (e) => {
        if (this.state.selectedPosition === null && this.state.positionData.length > 0) {
            this.setState({
                shiftInputFailure: {
                    status: true,
                    message: "[Post Failed]: Please input a shift type.",
                    pointer: this.handlePosChange
                }
            });
            return;
        } else if (this.state.date.getHours() === this.state.endDate.getHours() && this.state.date.getMinutes() === this.state.endDate.getMinutes()) {
            this.setState({
                shiftInputFailure: {
                    status: true,
                    message: "[Post Failed]: Shift times can not be the same",
                    pointer: this.handleTimeChange
                }
            });
            return;
        }
        this.setState({confirmStatus: "wait-confirm"});
        console.log("----------------");
        console.log(this.state);
        console.log("Start Date");
        console.log(this.state.date);
        console.log("End Date");
        console.log(this.state.endDate);
    };

    handleConfirmPost = () => {
        this.setState({confirmStatus: "untested"}, function () {
            postShift(getCookie("user-bnid"), this.state);
            window.location.href = IP()+"/shifts";
        });
    };

    handleUnConfirm = () => {
        this.setState({confirmStatus: "untested"})
    };

    handleMessageChange = (e) => {
        this.setState({message:e.target.value});
    };

    //Main render function for the page.
    render() {
        //check if the shift type selected is of type mobile
        const isMobile = () => {
            return this.state.selectedPosition !== null && this.getCorrectPosNameFromPosMapping(this.state.selectedPosition, this.state.positionData) === "Mobile";
        };

        //check if the shift type selected is of type call-in
        const isCallin = () => {
            return this.state.selectedPosition !== null && this.getCorrectPosNameFromPosMapping(this.state.selectedPosition, this.state.positionData) === "Call-In";
        };
        //state constants
        const overNightWarning = this.state.overNightWarning;
        const longShiftWarning = this.state.longShiftWarning;
        const shiftInputFailure = this.state.shiftInputFailure;
        const confirmStatus = this.state.confirmStatus;

        const permanentCnt = {
            marginTop: "10px",
        };
        return (
            <div>
                {confirmStatus === "untested" &&
                <div id="scroll-wrap">
                    <div id="header-background"/>
                    <Header title = {"Shift Posting"}/>
                    <div style={{marginTop: "100px"}} className={"Content contentPostShifts yellowBordered"}>
                        <h2 style={{color: "black"}}>Post Shift</h2>
                        <p style={{color: "grey", fontSize: ".7em"}}>After a posted shift has been picked up, all
                            previous actions are final.</p>
                        <hr/>
                        <PositionList onChange={this.handlePosChange} data={this.state.positionData}/>
                        <h3>Shift Date</h3>
                        <DatePicker onChange={this.handleDateChange}/>
                        <h3>Shift Time</h3>
                        {/*If mobile or call-in are selected, display that the time is already been changed*/}
                        {isMobile() ?
                            (
                                <p>Time selected is 6:45 PM - 10:00 PM</p>
                            ) : isCallin() ? (<p>Time selected is 5:00 PM - 10:00 PM</p>) : (
                                <TimePicker onChange={this.handleTimeChange}/>
                            )
                        }
                        {
                            //set over night warning
                            overNightWarning.status && <p className={"cautionText"}>{overNightWarning.message}</p>
                        }
                        {
                            //set long shift warning
                            longShiftWarning.status && <p className={"cautionText"}>{longShiftWarning.message}</p>
                        }
                        <h3 style={{marginBottom: "5px"}}>Other Info</h3>
                        <p className={"smallLineHeight"}
                           style={{color: "grey", fontSize: ".7em", margin: "0", marginBottom: "5px"}}>Please add a
                            short
                            message that describes why
                            you are posting your shift. <br/><span style={{color: "red"}}>*This message will be attached in the mass email.</span>
                        </p>
                        <textarea placeholder={"Message..."} value = {this.state.message} onChange={(e)=>{e.persist();this.handleMessageChange(e)}}/*onChange={({nativeEvent: {target}}) => this.handleMessageChange(target)}*/ rows={"4"} cols={"47"}/>
                        <div style={permanentCnt} className={"flexRow"}>
                            <label className={"marginLess"}>Permanent?&nbsp;</label>
                            <input value={this.state.permShiftPosting} onChange={this.handlePermShiftChange}
                                   style={{marginLeft: "5px",}} className={"marginLess"} type="checkbox"/>
                        </div>
                        <p className={"smallLineHeight"} style={{color: "grey", fontSize: ".7em", margin: "0"}}>If this
                            check box is selected your offering this shift for the rest of
                            the working schedule.</p>
                        {shiftInputFailure.status && <p className={"failureText"}>{shiftInputFailure.message}</p>}
                        <div style={{paddingTop: "20px"}} className={"flexRow"}>
                            <div style={{width: "80%"}}/>
                            <button onClick={this.handlePost} className={"fadingButton right"}>Post</button>
                        </div>
                    </div>
                </div>
                }
                {confirmStatus === "wait-confirm" &&
                <div id="scroll-wrap">
                    <div id="header-background"/>
                    <Header title={"Shift Posting"}/>
                    <div style={{marginTop: "100px"}} className={"Content contentPostShifts yellowBordered"}>
                        <h2 style={{color: "black"}}>Confirm Posting</h2>
                        <hr/>
                        <h3>Shift Type : <span
                            className={"cautionText"}>{this.getCorrectPosNameFromPosMapping(this.state.selectedPosition, this.state.positionData)}</span>
                        </h3>
                        <h3>Indefinite : <span
                            className={"cautionText"}>{this.state.permShiftPosting === "on" ? "Yes" : "No"}</span></h3>
                        <div className={"flexRow"}>
                            <p>{this.state.date.toDateString() + " " + formatAMPM(this.state.date)}</p>
                            <img style={{marginTop: "20px"}} width={25} height={25}
                                 src={require('../rightArrow.png')}/>
                            <p>{this.state.endDate.toDateString() + " " + formatAMPM(this.state.endDate)}</p>
                        </div>
                        <p style={{color: "grey", fontSize: ".7em"}}>A shift posting can be canceled on the shifts page
                            but, after a posted shift has been picked up all
                            previous actions are final.</p>
                        <div style={{paddingTop: "20px"}} className={"flexRow"}>
                            <div style={{width: "80%"}}/>
                            <button onClick={this.handleUnConfirm} style={{marginTop: "3px"}}
                                    className={"clearButton"}>back
                            </button>
                            <button onClick={this.handleConfirmPost} className={"fadingButton right"}>Confirm</button>
                        </div>
                    </div>
                </div>
                }
                <Footer showgitstatus={true}/>
            </div>
        );
    }
}
