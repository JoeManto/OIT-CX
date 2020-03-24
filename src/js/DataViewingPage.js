import React from 'react';
import {UsersDataTable,ShiftDataTable,HelpDeskRecords} from './components/DataTableView';
import {getDataViewingData} from './DataFetchHandler';
import '../css/DataViewingPage.css';
import {AdminNavBar} from './components/AdminNavBar';

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
                    <div>
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