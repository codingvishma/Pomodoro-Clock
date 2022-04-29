const Pomodoro = () => {
  const [interval, setIntervalSection] = React.useState(""); //create the interval times for both sessions
  const [sessionCounter, setSessionCounter] = React.useState(25); //set the original session time as 25 minutes
  const [breakCounter, setBreakCounter] = React.useState(5); //create a session for the break
  const [timerType, setTimerType] = React.useState("Session"); //create a session for the timer
  const [timer, setTimer] = React.useState(25 * 60); //set the number of seconds with a loaded page of 25 minutes
  const [isPlaying, play] = React.useState(false); //running timer starts off
  const beep = React.useRef(); //sound audio from reference link
  const imageReference = React.useRef();

  React.useEffect(() => {
    if (isPlaying) { //if the timer is counting down
      let interval = setInterval(() => { //create the session as the given value either preset or customised to user preference
        setTimer(timer - 1); //make the timer count down by 1 second
        if (timer === 1) { //when the timer is at 1 second then play the beeping sound to alert the user that the session is over
          beep.current.play();
          beep.current.currentTime = 0;
        } else if (timer === 0) { //if the timer is at 0 seconds then see which session's label and time is next
          if (timerType === "Session") { //so if currently "Session", then set the "Break" session's label and time
            setTimerType("Break");
            setTimer(breakCounter * 60) //add the number of second in the "Break" session
          } else {
            setTimerType("Session"); //else if the current session was "Break", then make "Session" the next session
            setTimer(sessionCounter * 60) ////add the number of second in the "Session" session
          }
        }
      }, 1000);
      return () => clearInterval(interval); //if the reset is selected, clear the timer and reload the session from the start of timer
    } else {
      beep.current.pause(); //else if paused stop the timer 
      beep.current.currentTime = 0;
    }
  });

  React.useEffect(() => {
    let data = imageReference.current.getContext("2d"); //fit the image into the circle diameter
    let rad = (imageReference.current.height / 2) * 0.90;
    graphics(data, rad); //run the graphics function
    return () => data.clearRect(0, 0, imageReference.current.width, imageReference.current.height); //output the correct image size
  });

  //function to add graphics to the user interface and give visual of how much time is left
  const graphics = (data, rad) => {
    let lines;
    var myImage = new Image(200, 200);
    myImage.src = "https://www.icolorpalette.com/download/solidcolorimage/113003_solid_color_background_icolorpalette.png";
    myImage.onload = () => { // execute following code after the image is loaded
      data.save();
      data.beginPath(); //start the filling of line graphics in a clockwise motion
      data.arc(imageReference.current.height / 2, imageReference.current.height / 2, rad - 50, 0, 2 * Math.PI); //graphics a circle that will cut through the image
      data.clip();
      data.drawImage(myImage, 0, 0);
      data.restore(); // restore context before drawing the image
      data.save(); //save the data for timer graphics
      // The following is the graphicsing of the sixty lines representing each a minute on the clock
      data.translate(imageReference.current.height / 2, imageReference.current.height / 2);
      data.font = rad * 0.3 + "px Iceland"; //set an ideal font size for the countdown time
      data.fillStyle = "white";
      data.fillText(formatTime(), -44, 7); 
      for (let i = 0; i < 60; i++) {
        lines = i * Math.PI / 30; //set the value for the lines per second
        data.rotate(-lines); //rotate the line fill anticlockwise
        data.translate(0, -rad * 0.7);
        if (timer % 60 <= i)
          data.fillStyle = "#111110"; //as the timer goes down show the progress by making the lines black 1 per second
        else
          data.fillStyle = "#656d4a"; //else leave the lines grey to show there is still some second left to countdown
        data.rotate(Math.PI);
        data.fillRect(0, 0, 5, 30 + Math.cos(5 * i + Math.PI / 3) * 8); //fill the lines every 1 second countdown
        data.rotate(-Math.PI); 
        data.translate(0, rad * 0.7); //get the line values
        data.rotate(lines); 
      }
      data.restore(); //when line filling has gone round 1 full loop, restart the loop for the next minute
    }
  }

  const resetTimer = () => {
    beep.current.pause(); //if reset, stop the beeper
    beep.current.currentTime = 0; 
    setTimerType("Session"); //set the label to "Session"
    setTimer(25 * 60); //get the number of minutes and convert the seconds to count down
    setSessionCounter(25); //set the session counter display to 25 minutes
    setBreakCounter(5); //set the break counter session to 5 minutes
    play(false); //dont start the timer when the reset button is pressed even if a current session was already running
  }

  const formatTime = () => {
    let minutes = Math.floor(timer / 60).toString().padStart(2, '0'); 
    let seconds = (timer % 60).toString().padStart(2, '0'); 
    return `${minutes}:${seconds}`; //return the correct format of minutes to seconds left
  }

  return (
    <div id="clock-container">
      <TimerType title="break" counter={breakCounter} updateCounter={setBreakCounter} setTimer={setTimer} isPlaying={isPlaying} currentTimerType={timerType} />
      <TimerType title="session" counter={sessionCounter} updateCounter={setSessionCounter} setTimer={setTimer} isPlaying={isPlaying} currentTimerType={timerType} />
      <div id="timer">
        <div>
          <span id="timer-label">{timerType}</span>
          <span id="time-left" style={timer < 60 ? { "color": "red" } : { "color": "black" }} >{formatTime()}</span>
          <canvas id="canvas" ref={imageReference} width="300" height="300" time={formatTime()} graphics={graphics} />
          <button id="start_stop" onClick={() => {
            play(!isPlaying);
          }}>
            <i class={isPlaying ? "fa fa-pause fa-3x" : "fa fa-play fa-3x"}></i>
          </button>
          <button id="reset" onClick={resetTimer}>
            <i class="fa fa-refresh fa-3x"></i>
          </button>
        </div>
      </div>
      <audio id="beep" preload="auto" src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav" ref={beep}></audio>
    </div>);
};

const TimerType = (props) => {
  const title = props.title.charAt(0).toUpperCase() + props.title.slice(1);
  const label = props.title + "-label"; //add the label of each session
  const length = props.title + "-length"; //add the length of each session
  const increment = props.title + "-increment"; //add the increment arrow
  const decrement = props.title + "-decrement"; //add the decrement arrow
  const id = props.title + "-counter" 

  const updateCounter = (e) => { //function to update the counter when changed by the user
    if (!props.isPlaying) {
      if (e.currentTarget.value === "+" && props.counter !== 60) { //if the current timer value is increased and not more than 60 minutes
        props.updateCounter(props.counter + 1); //allow for an increment
        if (props.currentTimerType === title) //if the current timer title value is the same then
          props.setTimer(props.counter * 60 + 60); //get the timer value in minutes and get the value in seconds then add another minute 
      } else if (e.currentTarget.value === "-" && props.counter !== 1) { //else if the current timer value is decreased and not less than 1 minute
        props.updateCounter(props.counter - 1); //allow for a decrement
        if (props.currentTimerType === title) //if the current timer title value is the same then
          props.setTimer(props.counter * 60 - 60); //get the timer value in minutes and get the value in seconds then minus another minute 
      }
    }
  }

  return ( //return the following html script code for the page setup
    <div id={id}>
      <div>
        <div id={label}>
          <span>{title}</span>
        </div>
        <div id={length}>
          <span>{props.counter}</span>
        </div>
      </div>
      <button onClick={updateCounter} value='+' id={increment}>
        <i class="fa fa-arrow-up fa-3x"></i>
      </button>
      <button onClick={updateCounter} value="-" id={decrement}>
        <i class="fa fa-arrow-down fa-3x"></i>
      </button>
    </div>
  );
}

ReactDOM.render(<Pomodoro />, document.getElementById("App")); //render the Pomodoro App using ReactJS
