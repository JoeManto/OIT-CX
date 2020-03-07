import React from 'react';
import { CountDownMessage, Flex, Button } from './General';
import { AlertMessage } from './AlertMessage';
import { adminOpt } from '../DataFetchHandler';

function WIInputPanelDotProgession(props) {
	const coveredBubbleStyle = {
		width: "15px",
		height: "15px",
		backgroundColor: "white",
		border: "solid 2px white",
		borderRadius: "50%",
		marginRight: "5px"
	};

	const unCoveredBubbleStyle = {
		width: "15px",
		height: "15px",
		backgroundColor: "transperent",
		border: "solid 2px white",
		borderRadius: "50%",
		marginRight: "5px"
	};

	let progressBubble = i => {
		let isCovered = i <= props.current;
		if (i === 1) {
			Object.assign(coveredBubbleStyle, {
				animation: "progress-bubble-expand 0.5s 0.1s forwards"
			});
		}
		return (
			<div key={i} style={isCovered ? coveredBubbleStyle : unCoveredBubbleStyle} />
		);
	};

	let bubbles = new Array(props.max);

	for (let i = 0; i < bubbles.length; i++) bubbles[i] = progressBubble(i);

	return <Flex>{bubbles}</Flex>;
}

export class WTInputPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			type: null,
			value: null,
			key: null,
			firstRender: true
		};
	}

	handleInputChange = data => {
		this.setState({
			type: data.type,
			value: data.value,
			key: data.key,
			firstRender: false,
			error: false
		});
	};

	shouldSetError = () => {
		if (this.state.value === null || this.state.value === "") {
			return true;
		}
	};

	render() {
		return (
			<Flex direction={"row"}>
				<div className={"inputpanel-leftcnt"}>
					<h5 style={{ margin: 0, color: "white" }} onClick={() => { this.props.onExit() }}>Exit</h5>
				</div>

				<div className={"inputpanel-rightcnt"}>

					<WIInputPanelDotProgession
						max={this.props.progession.max}
						current={this.props.progession.current}
					/>

					<h2 className={"inputpanel-title"}>{this.props.title}</h2>
					<h6 className={"inputpanel-subtitle"}>{this.props.subtitle}</h6>

					<div className={"inputpanel-content-cnt"}>
						{React.cloneElement(this.props.children, {
							onInputChange: this.handleInputChange,
							title: this.props.title
						})}
						<div style={{ marginRight: "40px" }} />

						<Button
							btnText={
								this.props.progession.current + 1 < this.props.progession.max
									? this.props.nextStepTitle + " Step"
									: "Confirm"
							}
							onClick={() => {
								if (!this.shouldSetError()) {
									this.props.onNextProgression({
										type: this.state.type,
										key: this.state.key,
										value: this.state.value,
									});
								} else {
									this.setState({ error: true });
									this.props.onError("Expected field to contain a value");
								}
							}}
						/>

					</div>
				</div>
			</Flex>
		);
	}
}

export class WTInputPanelController extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			opened: false,
			completed: false,
			progession: {
				current: 0,
				max: this.props.numPanels
			},
			savedData: [],
			error: {
				status: false,
				message: null,
			},
			apiError: null,
			apiRes: null,
			apiStatus: "no-started",
		};

		this.children = React.Children.toArray(this.props.children);
	}

	handleProgression = data => {
		let savedData = this.state.savedData;
		savedData.push(data);
		console.log(savedData);

		let progression = this.state.progession;

		//fin
		if (progression.current + 1 === progression.max) {
			this.onCompletion();
			return;
		}

		this.setState({
			progession: {
				current: progression.current + 1,
				max: progression.max
			},
			savedData: savedData,
			error: {
				status: false,
				message: null,
			}
		});
	};

	onError = (message) => {
		this.setState({
			error: {
				status: true,
				message: message,
			}
		});
	}

	onExit = (shouldReset = false) => {
		if (shouldReset) {
			this.setState({
				opened: false,
				completed: false,
				progession: {
					current: 0,
					max: this.props.numPanels
				},
				savedData: [],
				apiError: null,
				apiRes: null,
				apiStatus: "no-started",
			});
		} else {
			this.setState({
				opened: false,
			});
		}
	}

	onReset = () => {
		this.setState({
			opened: true,
			completed: false,
			progession: {
				current: 0,
				max: this.props.numPanels
			},
			savedData: [],
			apiError: null,
			apiRes: null,
			apiStatus: "no-started",
		});
	}

	onCompletion = async () => {
		this.setState({
			completed: true
		});
		const delay = ms => new Promise(res => setTimeout(res, ms));
		await delay(2500);

		//make sure the endpoint has a '/' at the start
		let endpoint = this.props.endpoint;
		if (endpoint[0] !== '/') {
			endpoint = ['/', endpoint];
			endpoint = endpoint.join("");
		}

		let result = await adminOpt(this.props.endpoint, this.state.savedData);

		if (result.error) {
			this.setState({
				apiStatus: "error",
				apiError: result.error,
			});
			return;
		}

		this.setState({
			apiStatus: "success",
			apiRes: result.res,
		});
	}

	renderOpenView = () => {

		if (this.state.completed) {
			return this.renderCompletionView();
		}

		const progress = this.state.progession;
		return (
			React.cloneElement(this.children[progress.current], {
				progession: this.state.progession,
				nextStepTitle:
					progress.current + 1 >= progress.max
						? "Confirm"
						: this.children[progress.current + 1].props.title,
				onNextProgression: this.handleProgression,
				onExit: this.onExit,
				onError: this.onError,
			})
		);
	}

	renderClosedView = () => {
		const progress = this.state.progession;
		console.log(this.children);

		return (
			<div>
				{progress.current !== 0 ?
					(
						<div>
							<Button btnText={"Continue with " + this.children[progress.current].props.title} onClick={() => {
								this.setState({ opened: true })
							}} />
							<Button style={{ marginLeft: '20px' }} btnText={"Reset"} onClick={() => {
								this.onReset();
							}} />
						</div>
					) : (
						<Button onClick={() => { this.setState({ opened: true }) }} btnText={"Start"} />
					)}
			</div>
		);
	}

	renderApiError = ({ error, errorMessage }) => {
		return (
			<div>
				<h3>Server Response - Failed<span role={"img"}>⚠️</span></h3>
				<CountDownMessage message={'Closing in'} count={25} onCompletion={() => { this.onExit(true) }}>
					<h5>{error}</h5>
					<p style={{ color: 'darkgrey' }}>{errorMessage}</p>
				</CountDownMessage>
			</div>
		)
	}

	renderApiSuccess = ({ res }) => {
		return (
			<div>
				<h3>Server Response - Success<span role="img">🎉</span></h3>
				<CountDownMessage message={'Closing in'} count={25} onCompletion={() => { this.onExit(true) }}>
					<p style={{ color: 'darkgrey' }}>{res}</p>
				</CountDownMessage>
			</div>
		)
	}

	renderCompletionView = () => {
		if (this.state.apiStatus === "success") {
			return (
				<div className={"inputhandler-completion-cnt"}>
					{this.renderApiSuccess(this.state.apiRes)}
				</div>
			);
		} else if (this.state.apiStatus === "error") {
			return (
				<div className={"inputhandler-completion-cnt"}>
					{this.renderApiError(this.state.apiError)}
				</div>
			);
		}

		return (
			<div className={"inputhandler-completion-cnt"}>
				<div className={"progressAnimated"} />
			</div>
		)
	}

	render() {
		return (
			<div className={"inputpanelcontroller-cnt"}>

				{this.state.error.status &&
					<AlertMessage message={this.state.error.message} />
				}

				<div className={"inputpanelcontroller-header-cnt"}>
					<h3>{this.props.title}</h3>
					<p>{this.props.description}</p>
				</div>
				<div className={"inputpanelcontroller-content-cnt"}>
					{this.state.opened ? (
						this.renderOpenView()
					) : (
							this.renderClosedView()
						)}
				</div>
			</div>
		);
	}
}

export class Input1 extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedValue: null
		};

		this.inputRef = React.createRef();
	}

	handleInputChange = () => {
		this.setState({ selectValue: this.inputRef.current.value });
		this.props.onInputChange({
			type: "input",
			value: this.inputRef.current.value,
			key: this.props.title
		});
	};

	render() {
		return (
			<div className={"inputbox1-outer-cnt"}>
				<div className={"inputbox1-name-cnt"}>
					<h5 className={"inputbox1-name"}>{this.props.title}</h5>
				</div>
				<input
					ref={this.inputRef}
					onChange={() => {
						this.handleInputChange();
					}}
					className={"inputbox1"}
					placeholder={this.props.placeholder}
				/>
			</div>
		);
	}
}

export class SelectionController extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectionToggle: this.props.open,
			selectedValue: undefined
		};
	}

	handleToggle = () => {
		this.setState({ selectionToggle: !this.state.selectionToggle });
	};

	handleSelection = selectionEvent => {
		this.setState({
			selectionToggle: false,
			selectedValue: selectionEvent.target.value
		});
		this.props.onInputChange({
			type: "select",
			value: selectionEvent.target.value,
			key: this.props.title
		});
	};

	selectionButton = () => {
		let btnText = this.state.selectedValue
			? this.state.selectedValue
			: "Select";
		return (
			<Button
				btnText={btnText}
				onClick={() => {
					this.handleToggle();
				}}
			/>
		);
	};

	render() {
		return (
			<div>
				{this.selectionButton()}
				{this.state.selectionToggle && (
					<Selection
						selected={this.state.selectedValue}
						fields={this.props.fields}
						onSelection={e => {
							this.handleSelection(e);
						}}
					/>
				)}
			</div>
		);
	}
}

export function Selection(props) {
	let renderField = (obj, i) => {
		return (
			<option
				onClick={e => {
					e.persist();
					props.onSelection(e);
				}}
				key={i}
				value={obj}
				className={
					props.selected === obj
						? "selection1-option"
						: "selection1-option-unselected"
				}
			>
				{obj}
			</option>
		);
	};

	return (
		<div className={"selection1-cnt"}>
			{props.fields.map((obj, i) => {
				return renderField(obj, i);
			})}
		</div>
	);
}