import {Map, List, fromJS} from 'immutable';

var log = console.log.bind(console, 'reducer ::');

var initialState = fromJS({
  NODE_ENV: null,
  guest: true,
  member: false,
  admin: false,
  login: {
    loading: false,
    error_message: null
  },
  signup: {
    loading: false,
    error_message: null
  },
  // resp from /api/v1/users/me
  user: {
    _id: null,
    dogecoinBlioAddress: null,
    provider: null,
    username: null,
    dogeBalance: null,
    created: null,
    roles: [],
    email: null
  },
  matches: [],
  moreMatchesLoading: false,
  matchesEnd: false,
  matchDetail: {
    bets: [],
    match: {}
  },
  myBets: [],
  transactionHistory: [],
  adminPanel: {
    matches: [],
    tournaments: []
  }
});

function login( state, action ){
  switch( action.type ){
    case 'POST_LOGIN':
      var _state = fromJS({
        login: {
          loading: true
        }
      });
      return state.merge( _state )
    case 'LOGIN_SUCCESS':
      var _state = fromJS({
        guest: false,
        member: true,
        admin: false,
        login: {
          loading: false,
          error_message: null
        },
        user: action.payload
      });
      return state.merge( _state )
    case 'LOGIN_ERROR':
      var _state = fromJS({
        login: {
          loading: false,
          error_message: action.payload.message
        }
      });
      return state.merge( _state )
    case 'CLEAR_LOGIN_STATE':
      var _state = fromJS({
        login: {
          error_message: null
        }
      });
      return state.mergeDeep( _state )
    case 'LOGOUT_SUCCESS':
      var _state = fromJS({
        guest: true,
        member: false,
        admin: false,
        user: {}
      });
      return state.merge( _state );
  }
  return state;
}

function signup( state, action ){
  switch( action.type ){
    case 'POST_SIGNUP':
      var _state = fromJS({
        signup: {
          loading: true
        }
      });
      return state.merge( _state );
    case 'SIGNUP_ERROR':
      var _state = fromJS({
        signup: {
          loading: false,
          error_message: action.payload.message
        }
      });
      return state.merge( _state )
    case 'SIGNUP_SUCCESS':
      var _state = fromJS({
        guest: false,
        member: true,
        admin: false,
        signup: {
          loading: false,
          error_message: null
        },
        user: action.payload
      });
      return state.merge( _state )
    case 'CLEAR_SIGNUP_STATE':
      var _state = fromJS({
        signup: {
          error_message: null
        }
      });
      return state.mergeDeep( _state )
  }
  return state;
}

function setUser( state, action ){
  switch( action.type ){
    case 'SET_GUEST':
      var _state = fromJS({
        guest: true,
        member: false,
        admin: false,
        user: {}
      });
      return state.merge( _state );
    case 'SET_MEMBER':
      var _state = fromJS({
        guest: false,
        member: true,
        admin: false,
        user: action.payload
      });
      return state.merge( _state );
  }
  return state;
}

function me( substate, action ){
  switch( action.type ){
    case 'UPDATE_ME':
      return fromJS( action.payload );
  }
  return substate;
}

// TODO: read roles from data, deal with admin
function settings( state, action )
{
  switch( action.type ){
    case 'SET_SETTINGS':
      var _state = fromJS( action.payload );
      var member = !!_state.get('user');
      var guest = _state.get('user');
      var admin = false;
      if( member ) admin = _state.getIn(['user', 'roles']).includes('admin');
      // logged in
      if( admin ){
        _state = _state.merge(
          fromJS({
            guest: false,
            member: true,
            admin: true
          })
        );
      }
      else if( member ){
        _state = _state.merge(
          fromJS({
            guest: false,
            member: true,
            admin: false
          })
        );
      }
      // logged out
      else{
        _state = _state.merge(
          fromJS({
            guest: true,
            member: false,
            admin: false
          })
        );
      }
      return state.merge( _state );
  }
  return state;
}

function matches( substate, action )
{
  switch( action.type ){
    case 'GET_MATCHES_SUCCESS':
      var _substate = fromJS( action.payload );
      return _substate;
  }
  return substate;
}

function match( substate, action )
{
  switch( action.type ){
    case 'GET_MATCH_DETAIL_SUCCESS':
      var _substate = fromJS( action.payload );
      return _substate;
  }
  return substate;
}

function mybets( substate, action )
{
  switch (action.type){
    case 'GET_MY_BETS_SUCCESS':
      var _substate = fromJS(action.payload);
      return _substate;
  }
  return substate;
}

function transactionhistory(substate, action)
{
  switch(action.type) {
    case 'GET_TRANSACTION_HISTORY_SUCCESS':
      var _substate = fromJS(action.payload);
      return _substate;
  }
  return substate;
}

function adminpanel( substate, action )
{
  switch( action.type ){
    case 'GET_ADMIN_PANEL_SUCCESS':
      var _substate = fromJS( action.payload );
      return _substate;
  }
  return substate;
}

// put misc global actions here
function core( state, action ){
  switch (action.type){
    case 'POST_BET_SUCCESS':
      var response = fromJS( action.payload );
      // subtract amount from balance
      var _state = fromJS({
        user: {
          dogeBalance: state.getIn(['user', 'dogeBalance']) - response.get('amount')
        }
      });
      return state.mergeDeep( _state );
    // TODO: Error can be handled by component
    case 'POST_BET_ERROR':
      return state;
    case 'GET_MORE_MATCHES':
      var _state = fromJS({
        moreMatchesLoading: true
      });
      return state.mergeDeep( _state );
    case 'GET_MORE_MATCHES_SUCCESS':
      var _items = fromJS( action.payload );
      var matchesEnd = action.payload.length === 0;
      var _state = fromJS({
        moreMatchesLoading: false,
        matches: state.get('matches').concat( fromJS( _items ) ),
        matchesEnd: matchesEnd
      });
      return state.mergeDeep( _state );
  }
  return state;
}

function reducer(state = initialState, action) {
  log('action >>', action.type, action.status, action.payload);

  var reducers = [
    // need access to whole state obj, can modify any part of it
    { reducer: core },
    { reducer: login },
    { reducer: signup },
    { reducer: setUser },
    { reducer: settings },
    // keyPath is path to sub_obj, only modify that
    { reducer: matches, keyPath: ['matches'] },
    { reducer: match, keyPath: ['matchDetail'] },
    { reducer: me, keyPath: ['user'] },
    { reducer: mybets, keyPath: ['myBets'] },
    { reducer: transactionhistory, keyPath: ['transactionHistory'] },
    { reducer: adminpanel, keyPath: ['adminPanel'] }
  ];

  function reducerFn( state, item, index ){
    var _substate;
    var { reducer, keyPath } = item;
    if( !keyPath || !keyPath.length )
      return reducer( state, action );
    else{
      _substate = state.getIn( keyPath );
      return state.setIn( keyPath, reducer( _substate, action ) );
    }
  };

  return reducers.reduce( reducerFn, state);
}

export default reducer;
