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
    console.log('Router::constructor')
    this.state = {
      component: '',
      page_loading: true
    };
    this.page_load_promises = [];
    util.bindAll( this, 'setupRoutes', 'getData' );
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
    // 404
    page.start();
  }
  getData( ctx, next ){
    // get Component + its dependencies async via webpack

    var component_promise =
      new Promise(function(res, rej){
        ctx.routeData.asyncRequire( ( Component ) => {
          res(Component);
        });
      });

    console.log('Router::getData::page_loading');
    this.setState({
      page_loading: true
    });

    component_promise.then( Component => {
      console.log('Router::getData::component');
      this.setState({
        component: Component,
        page_loading: false
      });
    });

    // Promise
    //   .all( [component_promise] )
    //   .then( values => {
    //     this.setState({
    //       component: values[1],
    //       page_loading: false
    //     });
    //   });

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
    console.log('Router::Render');
    var loading = this.state.page_loading ?
                    <div className="spinner rotate clockwise absolute" ></div> : null;
    var RoutedComponent = this.state.component || null;

    return (
      <Layout member={this.props.member}
              logout={::this.logout}
              user={ this.props.user } >
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
    user: storeState.get('user') ? storeState.get('user').toJS() : null
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

