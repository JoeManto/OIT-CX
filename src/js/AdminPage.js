import React from 'react';
import '../css/AdminPage.css';
import '../css/util.css';
import '../css/OperationTutorialView.css';
import {WTInputPanelController,WTInputPanel,Input1,SelectionController} from './components/OperationTutorialView'


 export default class AdminPage extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        return(
			<div className = "admin-operations-cnt">
			<h1 style = {{fontStyle:'oblique'}}>Operations</h1>
			<p style = {{color:'darkgrey'}}>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
			 standard dummy text ever since the 1500s.>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
			  industry's standard dummy text ever since the 1500s.</p>
		
            <div className = "admin-operations-list-cnt">
				<WTInputPanelController title = {'Add User'}
				 description = {`
				 Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.	
				`} 
				numPanels={4}>
                    <WTInputPanel
                    title={"Bronco Net-ID"}
                    subtitle={"Western Michigan University ID"}
                    >
                        <Input1 title={"Bnid"} />
                    </WTInputPanel>

                    <WTInputPanel 
                    title={"Department"} 
                    subtitle={"OIT Department"}>
                        <SelectionController
							open = {true}
                            fields={["Help-Desk", "Class Tech", "Operators"]}
                        />
                    </WTInputPanel>

                    <WTInputPanel 
                    title={"Preferred Name"}
                    subtitle={"IDK A NAME"}>
                        <Input1 title={"Name"} />
                    </WTInputPanel>

                    <WTInputPanel
                    title={"User Role"}
                    subtitle={"Assignment of permissions"}
                    >
                        <SelectionController open = {true} fields={["Normal", "Supervisor"]} />
                    </WTInputPanel>
                </WTInputPanelController>
            </div>
			</div>
        );
    }
}
