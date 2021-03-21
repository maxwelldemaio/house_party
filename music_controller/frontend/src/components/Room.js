// Main landing page for a new room
import React, { Component } from 'react';
import { Grid, Button, Typography } from "@material-ui/core";
import ButtonAppBar from "./ButtonAppBar";
import CreateRoomPage from "./CreateRoomPage";

export default class Room extends Component{
    constructor(props){
        super(props);
        this.state = {
            votesToSkip: 2,
            guestCanPause: false,
            isHost: false,
            showSettings: false,
        };
        // Match prop stores how we got to this component from Router
        this.roomCode = this.props.match.params.roomCode;
        // Bind this to our functions so we can access it
        this.getRoomDetails = this.getRoomDetails.bind(this);
        this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
        this.updateShowSettings = this.updateShowSettings.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
        this.renderSettingsButton = this.renderSettingsButton.bind(this);

        // Call once everything is constructed
        // Starts with defaults and then gets populated
        this.getRoomDetails();
    }

    getRoomDetails() {
        fetch('/api/get-room' + '?code=' + this.roomCode)
            // Make sure we get a valid response and update state
            .then((response) => {
                if (!response.ok) {
                    // Leave room if not valid
                    this.props.leaveRoomCallback();
                    this.props.push.history.push("/");
                }
                return response.json();
            })
            .then((data) => {
                this.setState({
                    votesToSkip: data.votes_to_skip,
                    guestCanPause: data.guest_can_pause,
                    isHost: data.is_host,
                })
            })
    }

    // Method to leave the current room the user is in (keep session in mind)
    // Call to our API endpoint to pop user from room or close if they are host
    leaveButtonPressed() {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        };
        fetch("/api/leave-room", requestOptions).then((_response) => {
            // Once room left, redirect to homepage
            this.props.leaveRoomCallback();
            this.props.history.push("/");
        });
    }

    updateShowSettings(value) {
        this.setState({
            showSettings: value,
        });
    }

    renderSettings() {
        return (
            
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <CreateRoomPage
                        update={true}
                        votesToSkip={this.state.votesToSkip}
                        guestCanPause={this.state.guestCanPause}
                        roomCode={this.roomCode}
                        // Update room with correct state (curr vals per backend)
                        updateCallback={this.getRoomDetails}
                    />
                </Grid>
                <Grid item xs={12} align="center">
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => this.updateShowSettings(false)}
                    >
                        Close
                    </Button>
                </Grid>
            </Grid>
        );
    }


    // Only show settings button if user is host
    renderSettingsButton() {
        return (
            <Grid item xs={12} align="center">
                <Button variant="contained" color="primary" onClick={() => this.updateShowSettings(true)}>
                    Settings
                </Button>
            </Grid>
        );
    }

    render() {
        if (this.state.showSettings) {
            return this.renderSettings();
        }

        return (
            <div>
                <ButtonAppBar />
                <Grid container spacing={1} align="center">
                    <Grid item xs={12}>
                        <Typography variant="h5" component="h5">
                            Code: {this.roomCode}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h5" component="h5">
                            Host: {this.state.isHost.toString()}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h5" component="h5">
                            Votes: {this.state.votesToSkip}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h5" component="h5">
                            Guests Can Pause: {this.state.guestCanPause.toString()}
                        </Typography>
                    </Grid>
                    {this.state.isHost ? this.renderSettingsButton() : null}
                    <Grid item xs={12}>
                        <Button color="secondary" variant="contained" onClick={this.leaveButtonPressed}>
                            Leave Room
                    </Button>
                    </Grid>
                </Grid>
            </div>
        )
    }
}