import { NEXT_URL } from "@/config";
import { Post } from "@/models";
import { getTokenExpired } from "@/globals";

export const getAllPosts = async (page: number) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }
  const response = await fetch(`/api/posts/posts/${page}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  const data = await response.json();
  return data;
};

export const addLike = async (
  postId: number,
  data: { userName: string | undefined; profilePicture: string | undefined }
) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }

  const response = await fetch(`/api/posts/likes/add/${postId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(data),
  });
  const res = await response.json();
  return res;
};

export const removeLike = async (
  postId: number,
  data: { userName: string | undefined; profilePicture: string | undefined }
) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }
  const response = await fetch(`/api/posts/likes/remove/${postId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(data),
  });
  const res = await response.json();
  return res;
};

export const createPostBE = async (post: Post) => {
  const data = { post };
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }
  const response = await fetch(`/api/posts/create-post`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(data),
  });
  const res = await response.json();
  return res;
};

export const getPostsUserById = async (userId: string) => {
  try {
    const itemToken = localStorage.getItem("jwtToken");
    let token = itemToken ? itemToken : false;

    const itemEmail = localStorage.getItem("email");
    const email = itemEmail ? itemEmail : "";

    const tokenBE = await getTokenExpired(token, email);
    if (tokenBE.isNew) {
      localStorage.setItem("jwtToken", tokenBE.token);
      token = tokenBE.token;
    }
    const response = await fetch(`/api/posts/user/${userId}`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
  }
};

export const getPostByIdBE = async (postId: number) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }

  const response = await fetch(`/api/posts/onlyOne/${postId}`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const data = await response.json();
  return data;
};

export const getCommentsByPost = async (postId: number) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }

  const response = await fetch(`/api/posts/comments/${postId}`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const data = await response.json();
  return data.comments;
};

export const addReply = async (
  postId: number,
  commentId: number,
  data: { userName: string; comment: string; profilePicture: string }
) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }
  const response = await fetch(
    `/api/posts/addReply/${postId}/${commentId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(data),
    }
  );
  const res = await response.json();
  return res;
};

export const addComment = async (
  postId: number,
  data: { userName: string; profilePicture: string; comment: string }
) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }

  const response = await fetch(`/api/posts/addComment/${postId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(data),
  });
  const res = await response.json();
  return res;
};

export const removeLikeComment = async (
  postId: number,
  commentId: number,
  userName: string
) => {
  const data = { userNameLike: userName };
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }

  const response = await fetch(
    `/api/posts/comment/${postId}/unlike/${commentId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(data),
    }
  );
  const res = await response.json();
  return res;
};

export const addLikeComment = async (
  postId: number,
  commentId: number,
  userName: string
) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }
  const data = { userNameLike: userName };
  const response = await fetch(
    `/api/posts/comment/${postId}/like/${commentId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(data),
    }
  );
  const res = await response.json();
  return res;
};

export const removeLikeReply = async (
  postId: number,
  commentId: number,
  replyId: number,
  userName: string
) => {
  const data = { userNameLikeReply: userName };
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }
  const response = await fetch(
    `/api/posts/unLikeReply/${postId}/${commentId}/${replyId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(data),
    }
  );
  const res = await response.json();
  return res;
};

export const addLikeReply = async (
  postId: number,
  commentId: number,
  replyId: number,
  userName: string
) => {
  const data = { userNameLikeReply: userName };
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }

  const response = await fetch(
    `/api/posts/likeReply/${postId}/${commentId}/${replyId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(data),
    }
  );
  const res = await response.json();
  return res;
};

export const deleteCommentBE = async (postId: number, commentId: number) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }
  const response = await fetch(
    `/api/posts/delete/${postId}/comment/${commentId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }
  );
  const res = await response.json();
  return res;
};

export const deleteReplyBE = async (
  postId: number,
  commentId: number,
  replyId: number
) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }

  const response = await fetch(
    `/api/posts/delete/${postId}/comment/${commentId}/reply/${replyId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }
  );
  const res = await response.json();
  return res;
};

export const deletePostBE = async (postId: number | string) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }
  const response = await fetch(`/api/posts/deletePost/${postId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  const res = await response.json();
  return res;
};
