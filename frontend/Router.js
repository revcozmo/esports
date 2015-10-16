import {connect} from 'react-redux';
import * as actions from './actions/action_creators.js';

import reactMixin from 'react-mixin';
import page from 'page';
import cookies from 'cookies-js';

import _ from 'lodash';

import util from 'FE_util.js';

import Layout from 'components/Layout.js';
import { routeMap, middlewares, extendCtx } from 'routes.js';

class Router extends React.Component{
  constructor( props ){
    super(props);
    this.state = {
      component: '',
      page_loading: true
    };
    this.page_load_promises = [];
    util.bindAll( this, 'setupRoutes', 'getData' );

    // get user login state, reload page to get correct auth redirects
    this.login_promise = this.props.checkLogin();
    this.login_promise.then( () => {
      window.skip_abort = true;
      page(window.location.pathname);  // just send user state from BE to solve this properly
    });
  }
  componentDidMount(){
    this.setupRoutes();
  }
  setupRoutes(){
    // put data into router ctx
    extendCtx()
    // apply middlewares
    page('*', ...middlewares );
    // apply each route
    for( var url in routeMap ){
      page( url, this.getData );
    };
    // // 404
    page.start();
  }
  getData( ctx, next ){
    // get Component + its dependencies async via webpack

    var component_promise =
      new Promise(function(res, rej){
        ctx.routeData.asyncRequire( ( Component ) => {
          res(Component);
          //setTimeout( () => res(Component), 2000 );
        });
      });

    this.setState({
      page_loading: true
    });

    Promise
      .all( [this.login_promise, component_promise] )
      .then( values => {
        this.setState({
          component: values[1],
          page_loading: false
        });
      });

  }
  loginRedirect(){
    var redirect_to = cookies.get('redirect_to');
    if( redirect_to ) return page( redirect_to );
    return page('/');
  }
  logout(){
    this.props.executeLogout( (success) => {
      if( success ) page('/login');
    });
  }
  render(){
    var loading = this.state.page_loading ?
                    <div className="spinner rotate clockwise absolute" ></div> : null;
    var RoutedComponent = this.state.component || null;

    return (
      <Layout member={this.props.member}
              logout={::this.logout}
              person_data={ this.props.person_data } >
        { RoutedComponent && !loading ?
          <RoutedComponent
            { ...this.props }
            loginRedirect={::this.loginRedirect} /> :
          null
        }
        { loading ?
          loading :
          null
        }
      </Layout>
    )
  }
};

// export specific areas of state tree
var mapStateToProps = function( storeState ){
  return {
    page_loading: storeState.get('page_loading'),
    guest: storeState.get('guest'),
    member: storeState.get('member'),
    admin: storeState.get('admin'),
    person_data: storeState.get('person_data').toJS()
  }
};

// Creates Parent Container
// Populates this.props for Parent Container + Router Component
// this.props.( state obj defined in store )
// this.props.( actions defined in action_creators )
var RouterContainer = connect(
  mapStateToProps,            // subscribe to store update, expose store state
  actions                     // expose dispatch function, dispatch hooked to action_creators
)(Router);

export default RouterContainer;

