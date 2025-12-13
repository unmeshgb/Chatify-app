import React, { useEffect, useState } from "react";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Messages from "./Messages";
import IconButton from "@material-ui/core/IconButton";
import { useParams } from "react-router-dom";
import { channelsAPI, messagesAPI, socketAPI } from "../services/api";
import ScrollableFeed from "react-scrollable-feed";
import { BiHash } from "react-icons/bi";
import { FiSend } from "react-icons/fi";
import { GrEmoji } from "react-icons/gr";
import { Picker } from "emoji-mart";
import { RiImageAddLine } from "react-icons/ri";
import FileUpload from "./FileUpload";
import "emoji-mart/css/emoji-mart.css";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  chat: {
    position: "relative",
    height: "calc(100vh - 200px)",
    paddingLeft: "10px",
    paddingBottom: "5px",
    paddingTop: "5px",
  },
  footer: {
    paddingRight: "15px",
    paddingLeft: "15px",
    paddingTop: "10px",
  },
  message: {
    width: "100%",
    color: "white",
  },
  roomName: {
    border: "1px solid #0000004a",
    borderLeft: 0,
    borderRight: 0,
    padding: "15px",
    display: "flex",
    color: "#e5e5e5",
  },
  roomNameText: {
    marginBlockEnd: 0,
    marginBlockStart: 0,
    paddingLeft: "5px",
  },
  iconDesign: {
    fontSize: "1.5em",
    color: "#e5e5e5",
  },
  footerContent: {
    display: "flex",
    backgroundColor: "#303753",
    borderRadius: "5px",
    alignItems: "center",
  },
  inputFile: {
    display: "none",
  },
}));

function Chat() {
  const classes = useStyles();
  const params = useParams();
  const [allMessages, setAllMessages] = useState([]);
  const [channelName, setChannelName] = useState("");
  const [userNewMsg, setUserNewMsg] = useState("");
  const [emojiBtn, setEmojiBtn] = useState(false);
  const [modalState, setModalState] = useState(false);
  const [file, setFileName] = useState(null);

  useEffect(() => {
    if (params.id && params.id !== 'undefined') {
      // Fetch channel info
      const fetchChannel = async () => {
        try {
          const response = await channelsAPI.getById(params.id);
          if (response.data.success) {
            setChannelName(response.data.channel.channelName);
          }
        } catch (error) {
          console.error('Error fetching channel:', error);
        }
      };

      // Fetch messages
      const fetchMessages = async () => {
        try {
          console.log('Fetching messages for channel:', params.id);
          const response = await messagesAPI.getByChannel(params.id);
          console.log('Messages response:', response.data);
          if (response.data.success) {
            const messages = response.data.messages.map((msg) => ({ id: msg._id, data: msg }));
            console.log('Mapped messages:', messages);
            setAllMessages(messages);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchChannel();
      fetchMessages();

      // Join channel for real-time updates
      socketAPI.joinChannel(params.id);

      // Listen for new messages
      socketAPI.onMessageReceived((newMessage) => {
        setAllMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => msg.id === newMessage._id);
          if (!exists) {
            return [...prev, { id: newMessage._id, data: newMessage }];
          }
          return prev;
        });
      });

      // Listen for reaction updates
      socketAPI.onReactionUpdated((updatedMessage) => {
        setAllMessages(prev => 
          prev.map(msg => 
            msg.id === updatedMessage._id 
              ? { ...msg, data: updatedMessage }
              : msg
          )
        );
      });

      // Listen for deleted messages
      socketAPI.onMessageDeleted((deletedMessageId) => {
        setAllMessages(prev => prev.filter(msg => msg.id !== deletedMessageId));
      });

      return () => {
        socketAPI.leaveChannel(params.id);
        socketAPI.offMessageReceived();
        socketAPI.offReactionUpdated();
        socketAPI.offMessageDeleted();
      };
    }
  }, [params]);

  const sendMsg = async (e) => {
    e.preventDefault();
    if (userNewMsg && params.id) {
      const userData = JSON.parse(localStorage.getItem("userDetails"));

      if (userData) {
        const messageData = {
          text: userNewMsg,
          channelId: params.id,
          postImg: null
        };

        try {
          const response = await messagesAPI.create(messageData);
          if (response.data.success) {
            const newMessage = { id: response.data.message._id, data: response.data.message };
            // Add message immediately to local state
            setAllMessages(prev => [...prev, newMessage]);
            // Emit to socket for real-time updates to other users
            socketAPI.sendMessage({
              ...response.data.message,
              channelId: params.id
            });
          }
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }

      setUserNewMsg("");
      setEmojiBtn(false);
    }
  };

  const addEmoji = (e) => {
    setUserNewMsg(userNewMsg + e.native);
  };

  const openModal = () => {
    setModalState(!modalState);
  };

  const handelFileUpload = (e) => {
    e.preventDefault();
    if (e.target.files[0]) {
      setFileName(e.target.files[0]);
      openModal();
    }
    e.target.value = null;
  };

  return (
    <div className={classes.root}>
      {modalState ? <FileUpload setState={openModal} file={file} onMessageSent={(newMessage) => {
        setAllMessages(prev => [...prev, { id: newMessage._id, data: newMessage }]);
        socketAPI.sendMessage({ ...newMessage, channelId: params.id });
      }} /> : null}
      <Grid item xs={12} className={classes.roomName}>
        <BiHash className={classes.iconDesign} />
        <h3 className={classes.roomNameText}>{channelName}</h3>
      </Grid>
      <Grid item xs={12} className={classes.chat}>
        <ScrollableFeed>
          {allMessages.map((message) => (
            <Messages
              key={message.id}
              values={message.data}
              msgId={message.id}
            />
          ))}
        </ScrollableFeed>
      </Grid>
      <div className={classes.footer}>
        <Grid item xs={12} className={classes.footerContent}>
          <input
            accept="image/*"
            className={classes.inputFile}
            id="icon-button-file"
            type="file"
            onChange={(e) => handelFileUpload(e)}
          />
          <label htmlFor="icon-button-file">
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
            >
              <RiImageAddLine style={{ color: "#b9bbbe" }} />
            </IconButton>
          </label>

          <IconButton
            color="primary"
            component="button"
            onClick={() => setEmojiBtn(!emojiBtn)}
          >
            <GrEmoji style={{ color: "#b9bbbe" }} />
          </IconButton>
          {emojiBtn ? <Picker onSelect={addEmoji} theme="dark" /> : null}

          <form
            autoComplete="off"
            style={{ width: "100%", display: "flex" }}
            onSubmit={(e) => sendMsg(e)}
          >
            <TextField
              className={classes.message}
              required
              id="outlined-basic"
              label="Enter Message"
              variant="outlined"
              multiline
              minRows={1}
              maxRows={2}
              value={userNewMsg}
              onChange={(e) => {
                setUserNewMsg(e.target.value);
              }}
            />
            <IconButton type="submit" component="button">
              <FiSend style={{ color: "#b9bbbe" }} />
            </IconButton>
          </form>
        </Grid>
      </div>
    </div>
  );
}

export default Chat;
