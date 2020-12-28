import { useCallback, useEffect, useReducer, useState } from "react";

import { UserFallback } from "./components/UserFallback";
import { UserForm } from "./components/UserForm";
import { UserView } from "./components/UserView";
import { fetchGithubUser } from "./userService";

const REQUEST_STATUS = {
  IDLE: "idle",
  PENDING: "pending",
  RESOLVED: "resolved",
  REJECTED: "rejected",
};

const asyncReducer = (state, action) => {
  switch (action.type) {
    case REQUEST_STATUS.PENDING:
      return {
        status: REQUEST_STATUS.PENDING,
        data: null,
        error: null,
      }
  
    case REQUEST_STATUS.IDLE:
      return {
        status: REQUEST_STATUS.IDLE,
        data: null,
        error: null,
      }
  
    case REQUEST_STATUS.RESOLVED:
      return {
        status: REQUEST_STATUS.RESOLVED,
        data: action.data,
        error: null,
      }
  
    case REQUEST_STATUS.REJECTED:
      return {
        status: REQUEST_STATUS.REJECTED,
        data: null,
        error: action.error,
      }
  
    default:
      throw Error(`Unhandled status: ${action.type}`);
  }
}

const useAsync = (asyncCallback, initialState) => {
  const [ state, dispatch ] = useReducer(asyncReducer, {
    status: REQUEST_STATUS.IDLE,
    user: null,
    error: null,
    ...initialState
  });

  const run = useCallback((promise) => {
    dispatch({ type: REQUEST_STATUS.PENDING });
    promise.then(
      (data) => dispatch({ type: REQUEST_STATUS.RESOLVED, data }),
      (error) => dispatch({ type: REQUEST_STATUS.REJECTED, error })
    );
  }, []);

  return { ...state, run };
}

const UserInfo = ({ userName }) => {
  const initialRequestStatus = userName
    ? REQUEST_STATUS.PENDING
    : REQUEST_STATUS.IDLE;

  const { status, error, data: user, run } = useAsync({
    status: initialRequestStatus,
  });

  useEffect(() => {
    if (!userName) return;
    return run(fetchGithubUser(userName))
  }, [userName, run]);

  switch (status) {
    case REQUEST_STATUS.IDLE:
      return 'Search an user';

    case REQUEST_STATUS.PENDING:
      return <UserFallback userName={userName} />  

    case REQUEST_STATUS.RESOLVED:
      return <UserView user={user} />  

    case REQUEST_STATUS.REJECTED:
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
            }}
        >
          There was an error
          <pre
            style={{
              whiteSpace: "normal",
              backgroundColor: "#d5d5d5",
              padding: 15,
              borderRadius: 5
            }}
          >
            {error}
          </pre>
        </div>
      )

    default:
      throw Error(`Unhandled status: ${status}`);
  }
};

const UserSection = ({ onSelect, userName }) => (
  <div>
    <div className="flex justify-center ">
      <UserInfo userName={userName} />
    </div>
  </div>
);

const App = () => {
  const [userName, setUserName] = useState(null);
  const handleSubmit = (newUserName) => setUserName(newUserName);
  const handleSelect = (newUserName) => setUserName(newUserName);

  return (
    <div>
      <UserForm userName={userName} onSubmit={handleSubmit} />
      <hr />
      <div className="m-4">
        <UserSection onSelect={handleSelect} userName={userName} />
      </div>
    </div>
  );
};

export default App;
