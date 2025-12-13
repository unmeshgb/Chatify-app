import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { useParams } from "react-router-dom";
import { messagesAPI } from "../services/api";

const useStyles = makeStyles((theme) => ({
  displayImage: {
    height: "105px",
    width: "180px",
  },
  imageName: {
    paddingLeft: "15px",
    fontSize: "1.3em",
  },
  imageDiv: {
    marginLeft: "16px",
    marginRight: "16px",
    marginTop: "-33px",
  },
}));

function FileUpload({ setState, file, onMessageSent }) {
  const params = useParams();
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  const [progress, setProgress] = useState(0);
  const [progressBar, setProgressBar] = useState({ display: "none" });
  const [message, setMessage] = useState("");

  const handleClose = () => {
    setOpen(false);
    setState();
  };

  const sendMsg = async (imageData) => {
    if (params.id) {
      const userData = JSON.parse(localStorage.getItem("userDetails"));

      if (userData) {
        const messageData = {
          text: message,
          channelId: params.id,
          postImg: imageData,
        };

        try {
          const response = await messagesAPI.create(messageData);
          if (response.data.success) {
            console.log("Image message sent successfully");
            if (onMessageSent) {
              onMessageSent(response.data.message);
            }
          }
        } catch (error) {
          console.error("Error sending message:", error);
          alert('Failed to send message. Please try again.');
        }
      }

      setMessage("");
    }
  };

  const fileObj = URL.createObjectURL(file);

  const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setProgressBar({ display: "block" });
    
    try {
      // Compress image first
      const compressedFile = await compressImage(file);
      
      // Convert compressed file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        setProgress(100);
        await sendMsg(reader.result);
        handleClose();
      };
      reader.onerror = (error) => {
        console.log(error);
        setProgressBar({ display: "none" });
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error compressing image:', error);
      setProgressBar({ display: "none" });
    }
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className={classes.imageDiv}>
          <img src={fileObj} alt={file.name} className={classes.displayImage} />
          <Typography className={classes.imageName}>{file.name}</Typography>
        </div>

        <DialogTitle id="alert-dialog-title">Upload Image</DialogTitle>

        <DialogContent>
          <form
            autoComplete="off"
            onSubmit={(e) => {
              handleUpload(e);
            }}
          >
            <TextField
              id="outlined-basic"
              label="Add A Message"
              fullWidth
              margin="normal"
              variant="outlined"
              style={{
                backgroundColor: "rgb(45, 45, 73)",
                borderRadius: "5px",
              }}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
            />
          </form>

          <div style={progressBar}>
            <Box display="flex" alignItems="center">
              <Box width="100%" mr={1}>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
              <Box minWidth={35}>
                <Typography variant="body2">{Math.round(progress)}%</Typography>
              </Box>
            </Box>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} style={{ color: "white" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={(e) => handleUpload(e)}
            color="primary"
            autoFocus
            variant="contained"
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default FileUpload;
