import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import { deepPurple } from "@material-ui/core/colors";
import IconButton from "@material-ui/core/IconButton";
import { AiFillLike } from "react-icons/ai";
import { AiFillFire } from "react-icons/ai";
import { AiFillHeart } from "react-icons/ai";
import { AiFillDelete } from "react-icons/ai";
import { messagesAPI, socketAPI } from "../services/api";
import { useParams } from "react-router-dom";
import DeleteModal from "./DeleteModal";
import { Anchorme } from "react-anchorme";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    position: "relative",
    padding: "8px",
  },
  paper: {
    padding: "10px",
    "&:hover": {
      backgroundColor: "#1f2436",
    },
  },
  avatar: {
    display: "inline-block",
    verticalAlign: "top",
  },
  chat: {
    display: "inline-block",
    paddingLeft: "1rem",
    width: "calc(100% - 50px)",
    wordBreak: "break-all",
  },
  chatHeading: {
    marginBlockStart: 0,
    marginBlockEnd: 0,
    display: "inline-block",
    fontSize: "1rem",
    fontWeight: "600",
    color: "white",
  },
  chatTimming: {
    marginBlockStart: 0,
    marginBlockEnd: 0,
    display: "inline-block",
    paddingLeft: "0.5em",
    color: "white",
  },
  chatText: {
    color: "#dcddde",
  },
  purple: {
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: "#3f51b5",
  },
  emojiDiv: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  emojiDivInner: {
    position: "absolute",
    right: 0,
    padding: "0 35px 0 32px",
  },
  emojiBtn: {
    fontSize: "1.1rem",
    color: "rgb(255 195 54)",
  },
  allEmoji: {
    backgroundColor: "#2d2e31ba",
    borderRadius: "5px",
    paddingLeft: "2px",
    paddingRight: "2px",
    display: "flex",
  },
  countEmojiBtn: {
    padding: "3px",
    borderRadius: "4px",
    fontSize: "0.8em",
    backgroundColor: "#ffffff4a",
    color: "#cacaca",
    paddingLeft: "5px",
    paddingRight: "5px",
    "&:hover": {
      backgroundColor: "#ffffff4a",
      color: "#e7e7e7",
    },
  },
}));

function Messages({ values, msgId }) {
  const [style, setStyle] = useState({ display: "none" });
  const [deleteModal, setDeleteModal] = useState(false);
  const classes = useStyles();

  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  const userId = userDetails?._id;
  const messegerUserId = values.userId;
  const date = new Date(values.createdAt || values.timestamp);
  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.getMonth();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const time = `${day}/${month}/${year}   ${hour}:${minute}`;

  const numLikes = values.likeCount;
  const numFire = values.fireCount;
  const numHeart = values.heartCount;

  const userLiked = values.likes?.get ? values.likes.get(userId) : values.likes?.[userId];
  const userFire = values.fire?.get ? values.fire.get(userId) : values.fire?.[userId];
  const userHeart = values.heart?.get ? values.heart.get(userId) : values.heart?.[userId];

  const postImg = values.postImg;

  const channelId = useParams().id;

  const selectedLike = userLiked
    ? { color: "#8ff879", backgroundColor: "#545454" }
    : null;

  const selectedHeart = userHeart
    ? { color: "#ff527d", backgroundColor: "#545454" }
    : null;

  const selectedFire = userFire
    ? { color: "#ffc336", backgroundColor: "#545454" }
    : null;

  const showDeleteModal = () => {
    setDeleteModal(!deleteModal);
  };

  const heartClick = async () => {
    try {
      const action = userHeart ? 'remove' : 'add';
      const response = await messagesAPI.updateReaction(msgId, {
        type: 'heart',
        action
      });
      
      if (response.data.success) {
        // Emit socket event for real-time updates
        socketAPI.sendReaction({
          messageId: msgId,
          channelId,
          message: response.data.message
        });
        console.log(action === 'add' ? 'Liked' : 'Disliked');
      }
    } catch (error) {
      console.error('Error updating heart reaction:', error);
    }
  };

  const fireClick = async () => {
    try {
      const action = userFire ? 'remove' : 'add';
      const response = await messagesAPI.updateReaction(msgId, {
        type: 'fire',
        action
      });
      
      if (response.data.success) {
        socketAPI.sendReaction({
          messageId: msgId,
          channelId,
          message: response.data.message
        });
        console.log(action === 'add' ? 'Liked' : 'Disliked');
      }
    } catch (error) {
      console.error('Error updating fire reaction:', error);
    }
  };

  const likeClick = async () => {
    try {
      const action = userLiked ? 'remove' : 'add';
      const response = await messagesAPI.updateReaction(msgId, {
        type: 'likes',
        action
      });
      
      if (response.data.success) {
        socketAPI.sendReaction({
          messageId: msgId,
          channelId,
          message: response.data.message
        });
        console.log(action === 'add' ? 'Liked' : 'Disliked');
      }
    } catch (error) {
      console.error('Error updating like reaction:', error);
    }
  };

  const deleteMsg = async (id) => {
    try {
      const response = await messagesAPI.delete(id);
      if (response.data.success) {
        socketAPI.sendDeleteMessage({
          messageId: id,
          channelId
        });
        console.log("deleted successfully");
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <Grid item xs={12} className={classes.root}>
      {deleteModal ? (
        <DeleteModal
          msgId={msgId}
          text={values.text}
          postImg={postImg}
          deleteMsg={deleteMsg}
          handleModal={showDeleteModal}
        />
      ) : null}
      <div
        className={classes.paper}
        onMouseEnter={(e) => {
          setStyle({ display: "block" });
        }}
        onMouseLeave={(e) => {
          setStyle({ display: "none" });
        }}
      >
        <div className={classes.avatar}>
          <Avatar
            alt={values.userName}
            src={values.userImg && !values.userImg.includes('via.placeholder') ? values.userImg : `https://ui-avatars.com/api/?name=${encodeURIComponent(values.userName || 'User')}&background=3f51b5&color=fff&size=40`}
            className={classes.purple}
          />
        </div>

        <div className={classes.chat}>
          <div>
            <h6 className={classes.chatHeading}>{values.userName}</h6>
            <p className={classes.chatTimming}>{time}</p>
          </div>

          <div className={classes.chatText}>
            {values.text.split("\n").map((txt, idx) => (
              <div key={idx}>
                <Anchorme target="_blank" rel="noreferrer noopener">
                  {txt}
                </Anchorme>
              </div>
            ))}
          </div>

          <Grid item xs={12} md={12} style={{ paddingTop: "5px" }}>
            {postImg && !postImg.includes('via.placeholder') ? (
              <img
                src={postImg}
                alt="user"
                style={{ height: "30vh", width: "auto", borderRadius: "4px" }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : null}
          </Grid>

          <div style={{ paddingTop: "5px", display: "flex" }}>
            {numLikes > 0 ? (
              <div style={{ padding: "3px" }}>
                <IconButton
                  component="span"
                  onClick={likeClick}
                  className={classes.countEmojiBtn}
                  style={selectedLike}
                >
                  <AiFillLike />
                  <div style={{ paddingLeft: "2px" }}>{numLikes}</div>
                </IconButton>
              </div>
            ) : null}

            {numFire > 0 ? (
              <div style={{ padding: "3px" }}>
                <IconButton
                  component="span"
                  onClick={fireClick}
                  className={classes.countEmojiBtn}
                  style={selectedFire}
                >
                  <AiFillFire />
                  <div style={{ paddingLeft: "2px" }}>{numFire}</div>
                </IconButton>
              </div>
            ) : null}

            {numHeart > 0 ? (
              <div style={{ padding: "3px" }}>
                <IconButton
                  component="span"
                  onClick={heartClick}
                  className={classes.countEmojiBtn}
                  style={selectedHeart}
                >
                  <AiFillHeart />
                  <div style={{ paddingLeft: "2px" }}>{numHeart}</div>
                </IconButton>
              </div>
            ) : null}
          </div>
        </div>

        <div className={classes.emojiDiv} style={style}>
          <div className={classes.emojiDivInner}>
            <div className={classes.allEmoji}>
              <IconButton
                component="span"
                style={{ padding: "4px" }}
                onClick={likeClick}
              >
                <AiFillLike className={classes.emojiBtn} />
              </IconButton>
              <IconButton
                component="span"
                style={{ padding: "4px" }}
                onClick={fireClick}
              >
                <AiFillFire className={classes.emojiBtn} />
              </IconButton>
              <IconButton
                component="span"
                style={{ padding: "4px" }}
                onClick={heartClick}
              >
                <AiFillHeart className={classes.emojiBtn} />
              </IconButton>
              {userId === messegerUserId ? (
                <IconButton
                  component="span"
                  style={{ padding: "4px" }}
                  onClick={showDeleteModal}
                >
                  <AiFillDelete
                    className={classes.emojiBtn}
                    color="#c3c3c3f0"
                  />
                </IconButton>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Grid>
  );
}

export default Messages;
