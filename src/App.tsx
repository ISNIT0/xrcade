import React from 'react';
import './App.css';

import baffle from 'baffle';
import { getJSON, postJSON } from './util';
import { config } from './config';
const mixpanel = (window as any).mixpanel;

const gibberish = [
  '\u2588',
  '\u2593',
  '\u2592',
  '\u2591',
  '\u2588',
  '\u2593',
  '\u2592',
  '\u2591',
  '\u2588',
  '\u2593',
  '\u2592',
  '\u2591',
  '\u003c',
  '\u003e',
  '\u002f'
];

interface Game {
  id: string,
  friendlyId: string,
  title: string,
  poster: string,
  video?: string,
  description: string,
  rating: number,
  url: string,
  showTitle?: boolean,
}

interface AppState {
  hasLoaded: boolean,
  baffle?: any,
  games?: Game[],
  reviewing?: Game,
  viewing?: Game,
}

const startVideo = (ev: any) => {
  const el = ev.target.closest('.game').querySelector('video');
  el.play && el.play();
}
const stopVideo = (ev: any) => {
  const el: HTMLVideoElement = ev.target.closest('.game').querySelector('video');
  el.pause();
  setTimeout(() => {
    el.currentTime = 0;
  });
}
const playGame = (game: Game) => {
  mixpanel.track("Play game", { "game": game.friendlyId });
  handleOutboundLink(game.url);
  window.location.hash = 'reviewing--' + game.friendlyId;

  const $a = document.createElement('a');
  $a.target = '_blank';
  $a.href = game.url;
  const el = document.body.appendChild($a);
  el.click();
  el.remove();
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

class App extends React.Component<any, AppState> {
  state: AppState = {
    hasLoaded: false,
  };

  preloadImages(games: Game[]) {
    return Promise.all(games.map(async (g, i) => {
      if (i > 4) {
        return g;
      } else {
        const blob = await fetch(g.poster).then(r => r.blob());
        g.poster = URL.createObjectURL(blob);
        return g;
      }
    }));
  }

  async loadDeps() {
    let games = await getJSON<Game[]>(`${config.api}/game/all`);
    games = await this.preloadImages(games);
    (this.state.baffle as any).reveal(500);
    await sleep(1000);
    this.setState({
      ...this.state,
      hasLoaded: true,
      baffle: null,
      games,
    });
    if (window.location.hash) {
      const [actionType, friendlyId] = window.location.hash.slice(1).split('--');
      this.setState({
        ...this.state,
        [actionType]: games.find(g => g.friendlyId === friendlyId)
      });
    }
  }

  componentDidMount() {
    if (!this.state.hasLoaded && !this.state.baffle) {
      this.setState({
        ...this.state,
        baffle: baffle('.App-header', { characters: gibberish, speed: 100 }).start()
      })
      this.loadDeps();
    }
  }

  render() {
    const showHeader = this.state.hasLoaded || this.state.baffle;
    const showGames = this.state.games && this.state.hasLoaded;
    const reviewing = this.state.reviewing;
    const viewing = this.state.viewing;
    const closeOverlay = () => {
      window.location.hash = '';
      this.setState({ ...this.state, reviewing: undefined });
    };
    return (
      <div className="App">
        <div className="header-links" style={{ opacity: this.state.hasLoaded ? 1 : 0 }}>
          <a href="https://webvr.info/" target='_blank' className='link'>how to play</a>
          <a href="https://forms.gle/dFCBVWvpdVRW5ocE8" target='_blank' className='link'>submit</a>
          {/* <a href="https://share.xrca.de/auth/facebook" target='_blank'>login</a> */}
        </div>
        <header className={`App-header ${!this.state.hasLoaded ? 'loading' : ''}`} style={{ opacity: showHeader ? 1 : 0 }}>
          <h1>XRca.de</h1>
        </header>
        <div className="page-description" style={{ opacity: this.state.hasLoaded ? 1 : 0 }}>
          Web games for your VR headset
        </div>

        <div className={`viewing ${viewing && showGames ? 'show' : ''}`} id={viewing ? 'viewing--' + viewing.friendlyId : ''}>
          {viewing ? (<>
            <h2>{viewing.title}</h2>
            <div className="info">
              <div className="left">
                <video poster={viewing.poster} src={viewing.video} loop={true} autoPlay={true} controls></video>
              </div>
              <div className="right">
                {viewing.description}
                <div className='rating-cont'>
                  <div className="rating pill"><span className="rating-num">{viewing.rating || '?'} </span><img src='./star.svg' /></div>
                </div>
                <ShareGame game={viewing} />
                <a href={viewing.url} className="play-button" onClick={(ev) => {
                  ev.preventDefault();
                  playGame(viewing);
                }}>PLAY</a>
              </div>
            </div>
          </>) : null}
        </div>

        <div className="games" style={{ opacity: showGames ? 1 : 0 }}>
          {(this.state.games || []).map(game => {
            return <GameTile game={game} parent={this} />
          })}
        </div>
        <div className={`overlay ${reviewing ? 'show' : ''}`} onClick={closeOverlay}>
          {
            reviewing ? (
              <div className="review-cont">
                <div className="review" onClick={(ev) => ev.stopPropagation()}>
                  <div className="close" onClick={closeOverlay}>x</div>
                  <h2>How was {reviewing.title}?</h2>
                  <RateGame game={reviewing} />

                  <ShareGame game={reviewing} />
                </div>
              </div>
            ) : null
          }
        </div>
        <footer>
          A project by <a href="https://espruino.com" target='_blank' className='link'>@gfwilliams</a> and <a href="https://simmsreeve.com" target='_blank' className='link'>@isnit0</a>
        </footer>
      </div>
    );
  }
}

interface RateGameState {
  game: Game,
  reviewSaving: 'not_selected' | 'pending' | 'saved',
}
class RateGame extends React.Component<{ game: Game }, RateGameState> {
  state: any = {
    game: null,
    reviewSaving: 'not_selected'
  };

  componentDidMount() {
    this.setState({
      ...this.state,
      game: this.props.game
    });
  }

  async rateGame(rating: number) {
    mixpanel.track("Rate game", { "game": this.state.game.friendlyId, rating });
    this.setState({ reviewSaving: 'pending' });
    await postJSON(`${config.api}/game/rate/${this.state.game.id}`, { value: rating });
    this.setState({ reviewSaving: 'saved' });
  }

  render() {
    return <div>
      {this.state.reviewSaving === 'not_selected'
        ? <>
          <StarRating stars={5} onRate={(rating) => this.rateGame(rating)} />
        </>
        :
        this.state.reviewSaving === 'pending'
          ? <>Saving...</>
          : <>Saved</>
      }
    </div>;
  }
}

class ShareGame extends React.Component<{ game: Game }> {
  render() {
    const game = this.props.game;
    const title = encodeURIComponent(`Check out ${game.title}`);
    const body = encodeURIComponent(`This game is awesome!\n${game.description}`);
    const url = encodeURIComponent(`https://share.xrca.de/share/${game.friendlyId}`);
    return <div>
      <ul className="share-buttons">
        <li><a href={`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`} title="Share on Facebook" target="_blank"><img alt="Share on Facebook" src="images/social_flat_rounded_rects_svg/Facebook.svg" /></a></li>
        <li><a href={`https://twitter.com/intent/tweet?source=${url}&text=${title}:%20${url}&via=xrca_de`} target="_blank" title="Tweet"><img alt="Tweet" src="images/social_flat_rounded_rects_svg/Twitter.svg" /></a></li>
        <li><a href={`http://www.reddit.com/submit?url=${url}&title=${title}`} target="_blank" title="Submit to Reddit"><img alt="Submit to Reddit" src="images/social_flat_rounded_rects_svg/Reddit.svg" /></a></li>
        <li><a href={`http://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=${body}&source=${url}`} target="_blank" title="Share on LinkedIn"><img alt="Share on LinkedIn" src="images/social_flat_rounded_rects_svg/LinkedIn.svg" /></a></li>
        <li><a href={`mailto:?subject=${title}&body=${body}:%20${url}`} target="_blank" title="Send email"><img alt="Send email" src="images/social_flat_rounded_rects_svg/Email.svg" /></a></li>
      </ul>
    </div>
  }
}

export default App;

function handleOutboundLink(href: string) {
  if ('ga' in window) {
    (window as any).ga('send', 'event', {
      eventCategory: 'Outbound Link',
      eventAction: 'click',
      eventLabel: href
    });
  }
}

class StarRating extends React.Component<{ stars: number, onRate: (rating: number) => void }> {
  render() {
    const stars = ','.repeat(this.props.stars - 1).split(',').map((_, index) => {
      return <span className='star' onClick={() => this.props.onRate(index + 1)}>⭐</span>
    });
    return <div className="star-rating">
      {stars}
    </div>
  }
}

class GameTile extends React.Component<{ game: Game, parent: App }> {
  render() {
    // this whole "parent" thing is bad... very bad
    const { game, parent } = this.props;
    return <div className="game" id={game.id} onMouseEnter={startVideo} onMouseLeave={stopVideo} onClick={() => playGame(game)}>
      <div className="info-button-cont" onClick={(ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        parent.setState({
          ...this.state,
          viewing: game,
        });
        mixpanel.track("View info", { "game": game.friendlyId });
        window.location.hash = 'viewing--' + game.friendlyId;
      }}>
        <img src='./info.svg' className='info-button' />
      </div>
      <div className='preview'>
        <img src={game.poster} alt="" />
        <video poster={game.poster} src={game.video} loop={true}></video>
        {game.showTitle !== false ? <h3>{game.title}</h3> : null}
      </div>
      <div className="info">
        <div className='rating-cont'>
          <div className="rating pill"><span className="rating-num">{game.rating || '?'} </span><img src='./star.svg' /></div>
        </div>
        {game.description}
        <br />
        <br />
        <a href={game.url} className="play-button" onClick={(ev) => {
          ev.preventDefault();
        }}>PLAY</a>
      </div>
    </div>
  }
}