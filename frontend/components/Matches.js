import page from 'page';
import 'pages/matches.sass';
import 'components/forms.sass';

import {connect} from 'react-redux';
import * as actions from '../actions/action_creators.js';

import moment from 'moment';

class Matches extends React.Component{
  render(){
    return (
      <div className="matches-page-container" >
        <div className="header">
          Matches
        </div>
        <div className="match-items">
          {
            this.props.matches.map( ( item ) => {
              var startMoment = moment(item.matchStartTime);
              return (
                <div  className="match-item clearfix"
                      key={item._id}
                      onClick={ () => page(`/matches/${item._id}`) } >
                  <div className="left-80" >
                    <div className="headline">
                      <a  className="link"
                          href={`/?gameName=${item.gameName}`}
                          target="_blank"
                          onClick={ (e) => e.stopPropagation() } >{ item.gameName }</a>
                      &nbsp;match between&nbsp;
                      <a  className="link"
                          href={`/?teamName=${item.outcomeNames[0]}`}
                          target="_blank"
                          onClick={ (e) => e.stopPropagation() } >{ item.outcomeNames[0] }</a>
                      &nbsp;and&nbsp;
                      <a  className="link"item
                          href={`/?teamName=${item.outcomeNames[1]}`}
                          target="_blank"
                          onClick={ (e) => e.stopPropagation() } >{ item.outcomeNames[1] }</a>
                    </div>
                    <div className="start-date">
                      Match begins on: &nbsp;
                      { startMoment.format("dddd, MMMM Do YYYY, h:mm:ss a") }
                      &nbsp;&nbsp;
                      ( { startMoment.fromNow() } )
                    </div>
                    <div className="start-date">
                      Pot: {item.betPot[0] + item.betPot[1]}
                    </div>
                  </div>
                  <div className="left-20" style={{ minHeight: "40px" }} >
                    <div  className="btn bet-btn"
                          onClick={ (e) => { e.stopPropagation(); page(`/matches/${item._id}?bet=1`) } } >
                      Place Bet
                    </div>
                  </div>
                </div>
              )
            })
          }
          {/*
            this.props.matches.map( ( item ) => {
              return (
                <div  className="match-item"
                      key={item._id}
                      onClick={ () => page(`/matches/${item._id}`) } >
                  <div className="start-date">
                    Match begins on: &nbsp;
                    { new Date(item.matchStartTime).toString() }
                  </div>
                  <pre>
                    { JSON.stringify( item, null, 2 ) }
                  </pre>
                </div>
              )
            })
          */}
        </div>
      </div>
    )
  }
}
var mapStateToProps = function( storeState ){
  return {
    matches: storeState.get('matches').toJS()
  }
};

var MatchesContainer = connect(
  mapStateToProps,            // subscribe to store update, expose store state
  actions                     // expose dispatch function, dispatch hooked to action_creators
)(Matches);

export default MatchesContainer;
