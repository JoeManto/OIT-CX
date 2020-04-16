import React from 'react';
//import {UsersDataTable,ShiftDataTable,HelpDeskRecords} from './components/DataTableView';
import {getDataViewingData} from './DataFetchHandler';
import '../css/DataViewingPage.css';
import {AdminNavBar} from './components/AdminNavBar';
import {Button} from './components/General';

import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css';

export default class DataViewingPage extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            userData:[],
            shiftData:[],
            helpdeskData:[],
            fetching:true,
        }
    }

    async componentDidMount(){
        let data = await getDataViewingData();


        this.setState({fetching:false,userData:data.res.userData,shiftData:data.res.shiftData,helpdeskData:data.res.helpdeskData});
    }

    render(){
        return(
            <div>
				<AdminNavBar/>
                {!this.state.fetching &&
                    <div style = {{display:'flex',flexDirection:'column',alignContent:'center'}}>
						<CollapsibleContentWithHeader open = {true} header = {'Users Table'} subheader = {`
						The users table contains all of the important data fields for all users in your department. Note all blank table records should be treated as the value doesn't exist.`}>
							<UsersDataTable data = {this.state.userData}/>
						</CollapsibleContentWithHeader>

                        <CollapsibleContentWithHeader header = {'Shifts Table'} subheader = {`
						The shifts table contains all active and non-active shifts from the database for your department. Note that both start time and start end are rounded down to the nearest hour, meaning the minutes for start and end time are not expressed in the table.`}>
							<ShiftDataTable data = {this.state.shiftData}/>
						</CollapsibleContentWithHeader>

                        <CollapsibleContentWithHeader header = {'HelpDesk Record Table'} subheader = {`
						The helpdesk records table contains all active and legacy records. Note all blank table records should be treated as the value doesn't exist.`}>
							<HelpDeskRecords data = {this.state.helpdeskData}/>
						</CollapsibleContentWithHeader>
                        <div style = {{marginTop:'100px'}}/>
                    </div>
                }
            </div>
        )
    }
}

class CollapsibleContentWithHeader extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            open:this.props.open,
        }
    }

    render(){
        return(
        <div className = {"collapsible-cnt"}>
            
			<div className = {'header'}>
				<h3 className = {"header-text"}>{this.props.header}</h3>
				<div className = {this.state.open ? 'arrow-up' : 'arrow-down'} onClick = {()=>{
					this.setState({open:!this.state.open})}
				}/>
				<p className = {'subHeader'}>{this.props.subheader}</p>
			</div>
			{this.state.open &&
				this.props.children
			}
        </div>
        );
    }
}

/*
[
    id: 3
    empyname: "Joe"
    surname: "Manto"
    role: "Supervisor"
    empybnid: "jfj5666"
    email: "joe.m.manto@wmich.edu"
    groupRole: 0
    locked: "UnLocked"
]
*/
class UsersDataTable extends React.Component {

    constructor(props){
        super(props);
        
        this.state = {
            columnDefs: [
            {
                headerName: "id", field: "id", sortable: true, filter: true
            }, {
                headerName: "empyname", field: "empyname", sortable: true, filter: true
            }, {
                headerName: "surname", field: "surname", sortable: true, filter: true
            }, {
                headerName: "role", field: "role", sortable: true, filter: true
            },{
                headerName: "empybnid", field: "empybnid", sortable: true, filter: true
            },{
                headerName: "locked", field: "locked", sortable: true, filter: true
            },{
                headerName: "password", field: "password", sortable: true, filter: true
            }
            ],
            rowData: this.props.data
          }

    }
    onGridReady = (params) => {
        this.api = params.api;
        this.columnApi = params.columnApi;

        this.setState({totalRowCount:this.api.getDisplayedRowCount(),rowCount:this.api.getDisplayedRowCount()});
    }

    filterChanged = (params) => {
        this.setState({rowCount:this.api.getDisplayedRowCount()});
    }

    render(){
        return(
            <div
            className="ag-theme-alpine-dark"
            style={{
            height: '500px',
            width: '1425px',
            margin: '0 auto'
            }}
          >
            <AgGridReact
              suppressMenuHide = "true"
              onGridReady={this.onGridReady}
              onFilterChanged={this.filterChanged}
              columnDefs={this.state.columnDefs}
              rowData={this.state.rowData}>
            </AgGridReact>
            <p>Rows displayed: {this.state.rowCount}/{this.state.totalRowCount}</p>
          </div>

        );
    }
}

/*
requestor: "gjb8089"
coveredBy: "non-existing user"
startTime: 3
endTime: 10
timeOfDay: "pm"
day: 15
month: 9
year: 2019
shiftType: "Walk-In"
datePosted: "9/26/2019"
active: "no"
*/
class ShiftDataTable extends React.Component {

    constructor(props){
        super(props);

        console.log(this.props.data);
        let data = [];
        for(let i = 0;i<this.props.data.length; i++){
            let d = this.props.data[i];
            d.datePosted = new Date(d.datePosted);
            d.date = new Date(d.date);
            data.push(d);
        }

        this.state = {
            columnDefs: [
            {
                headerName: "requestor", field: "requestor", sortable: true, filter: true
            }, {
                headerName: "coveredBy", field: "coveredBy", sortable: true, filter: true
            }, {
                headerName: "startTime", field: "startTime", sortable: true, filter: true
            }, {
                headerName: "endTime", field: "endTime", sortable: true, filter: true
            },{
                headerName: "date", field: "date", sortable: true, filter: 'agDateColumnFilter', type:['dateColumn']
            },{
                headerName: "shiftType", field: "shiftType", sortable: true, filter: true
            },{
                headerName: "datePosted", field: "datePosted",sortable: true, filter: 'agDateColumnFilter', type:['dateColumn']
            },{
                headerName: "active", field: "active", sortable: true, filter: true
            }  
            ],
            rowData: data,
          }
    }
    onGridReady = (params) => {
        this.api = params.api;
        this.columnApi = params.columnApi;

        this.setState({totalRowCount:this.api.getDisplayedRowCount(),rowCount:this.api.getDisplayedRowCount()});
    }

    filterChanged = (params) => {
        this.setState({rowCount:this.api.getDisplayedRowCount()});
    }

    render(){
        return(
            <div
            className="ag-theme-alpine-dark"
            style={{
            height: '500px',
            width: '1650px',
            margin: '0 auto'
            }}
          >
            <AgGridReact
              suppressMenuHide = "true"
              onGridReady={this.onGridReady}
              onFilterChanged={this.filterChanged}
              columnDefs={this.state.columnDefs}
              rowData={this.state.rowData}>
            </AgGridReact>
            <p>Rows displayed: {this.state.rowCount}/{this.state.totalRowCount}</p>
          </div>
        );
    }
}

/*
recordBy: "jfj5666"
day: 16
month: 8
year: 2019
customer: "zbz7037"
location: "Eicher/LeFevre"
*/
class HelpDeskRecords extends React.Component {

    constructor(props){
        super(props);
        const data = [];

        for(let i = 0;i<this.props.data.length; i++){
            let d = this.props.data[i];
            d.date = new Date(d.date);
            data.push(d);
        }

        this.state = {
            columnDefs: [
            {
                headerName: "recordBy", field: "recordBy", sortable: true, filter: true
            },{
                headerName: "customer", field: "customer", sortable: true, filter: true
            },{
                headerName: "location", field: "location", sortable: true, filter: true
            },{
                headerName: "date", field: "date", sortable: true, filter: 'agDateColumnFilter', type:['dateColumn']
            }
            ],
            rowData: data,
            totalRowCount:0,
            rowCount:0,
          }

          this.handleExport = this.handleExport.bind(this);
    }

    onGridReady = (params) => {
        this.api = params.api;
        this.columnApi = params.columnApi;

        this.setState({totalRowCount:this.api.getDisplayedRowCount(),rowCount:this.api.getDisplayedRowCount()});
    }

    filterChanged = (params) => {
        this.setState({rowCount:this.api.getDisplayedRowCount()});
    }

    handleExport () {
        this.api.exportDataAsCsv();
    }
    render(){
        return(
            <div
            className="ag-theme-alpine-dark"
            style={{
            height: '500px',
            width: '820px',
            margin: '0 auto'
            }}
          >
            <AgGridReact
              suppressMenuHide = "true"
              onGridReady={this.onGridReady}
              onFilterChanged={this.filterChanged}
              columnDefs={this.state.columnDefs}
              rowData={this.state.rowData}>
           
            </AgGridReact>
            <p>Rows displayed: {this.state.rowCount}/{this.state.totalRowCount}</p>
            <Button
				btnText={"export"}
				onClick={() => {
					this.handleExport();
                }}
                style = {{marginBottom:'25px'}}
			/>
          </div>

        );
    }
}