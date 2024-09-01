import React from 'react'
import Avatar from 'react-avatar';

const Client = ({username, theme}) => {
  return (
    <div className="client" > {/* this is a client theme change but think is is not important*/ }
      <Avatar name={username} size={50} round="14px" />
      <span className="username">{username}</span>
    </div>
  );
};

export default Client