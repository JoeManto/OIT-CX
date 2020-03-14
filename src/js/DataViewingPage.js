import React from 'react';
import {UsersDataTable,ShiftDataTable,HelpDeskRecords} from './components/DataTableView';
import {getDataViewingData} from './DataFetchHandler';

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

        console.log(data.res.helpdeskData);
        this.setState({fetching:false,userData:data.res.userData,shiftData:data.res.shiftData,helpdeskData:data.res.helpdeskData});
    }

    render(){

        const userData = [
            {
                empyname:'Joe',
                surname:'Manto',
                empybnid:'jfj5666',
                role:'Normal',
                email:'joe.m.manto@wmich.edu',
                locked:'locked',
            },
            {
                empyname:'Joe',
                surname:'Manto',
                empybnid:'jfj5666',
                role:'Supervisor',
                email:'joe.m.manto@wmich.edu',
                locked:'unlocked',
            }
        ];
        
        const shiftData = [
            {
                requestor:'Joe',
                coveredBy:'Manto',
                day:22,
                month:23,
                year:29,
                shiftType:'single',
                datePosted:'06/26/2020',
            },
            {
                requestor:'Joe',
                coveredBy:'Manto',
                day:29,
                month:23,
                year:29,
                shiftType:'single',
                datePosted:'06/26/2020',
            }
        ];

        const helpdeskRecordData = [
            {
                recordBy:'jfj5666',
                day:23,
                month:22,
                year:23,
                customer:'jfj5666',
                location:'Western Heights',
            },
            {
                recordBy:'jfj5666',
                day:23,
                month:29,
                year:23,
                customer:'jfj5666',
                location:'Western Heights',
            },  
        ]
        return(
            <div>
                {!this.state.fetching &&
                    <div>
                        <UsersDataTable data = {this.state.userData}/>
                        <ShiftDataTable data = {this.state.shiftData}/>
                        <HelpDeskRecords data = {this.state.helpdeskData}/>
                    </div>
                }
            </div>
        )
    }
}