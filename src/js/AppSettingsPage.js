import React from 'react';
import '../css/AppSettingsPage.css';
import '../css/util.css';
import '../css/OperationTutorialView.css';
import {WTInputPanelController,WTInputPanel,Input1,SelectionController} from './components/OperationTutorialView'
import {getPositionsForUser,getAllDepartments} from './DataFetchHandler'
import {AdminNavBar} from './components/AdminNavBar';


 export default class AppSettingsPage extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            isFetchingData:false,   
        }
    }

    async componentDidMount(){

        /*let resolves = await Promise.all([
            getPositionsForUser(false),
            getAllDepartments(),
        ]);

        resolves[0] = resolves[0].res.map((obj) => obj.posName); 
        resolves[1] = resolves[1].res.map((obj) => obj.groupName);

        this.setState({isFetchingData:false,positions:resolves[0],departments:resolves[1]});*/
    }

    render(){
        return(
            <div>
            <AdminNavBar/>
			<div className = "admin-operations-cnt">
			<h1 style = {{fontStyle:'oblique'}}>App Settings</h1>
			<p style = {{color:'darkgrey'}}>---</p>

            {this.state.isFetchingData ? (
                <h2>fetching data</h2>
            ):(
                <div className = "admin-operations-list-cnt">
				
                <WTInputPanelController endpoint = {'editEnvironmentVariable'} title = {'Update Email Password'}
				 description = {`
				 Updates the server's shift-posting email password.
				`} 
				numPanels={2}>
                    <WTInputPanel
                    title={"New Email Password"}
                    subtitle={""}
                    >
                        <Input1 title={"Password"} />
                    </WTInputPanel>

                    <WTInputPanel 
                    title={"Confirm"} 
                    subtitle={"This action needs a restart of the Docker container to take effect."}>
                        <SelectionController
                            open = {true}
                            fields={['Yes I understand']}
                        />
                    </WTInputPanel>
                </WTInputPanelController>

                <WTInputPanelController endpoint = {'editEnvironmentVariable'} title = {'Update LDAP Password'}
				 description = {`
				 Updates the server's LDAP password.
				`} 
				numPanels={2}>
                    <WTInputPanel
                    title={"New LDAP Password"}
                    subtitle={""}
                    >
                        <Input1 title={"Password"} />
                    </WTInputPanel>

                    <WTInputPanel 
                    title={"Confirm"} 
                    subtitle={"This action needs a restart of the Docker container to take effect."}>
                        <SelectionController
                            open = {true}
                            fields={['Yes I understand']}
                        />
                    </WTInputPanel>
                </WTInputPanelController>

                </div>
            )}     
            </div>
            </div>
        );
    }
}
