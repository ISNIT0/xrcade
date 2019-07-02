import React from 'react';
import './App.css';

import baffle from 'baffle';
import { getJSON, postJSON } from './util';
import { config } from './config';

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
  url: string
}

interface AppState {
  hasLoaded: boolean,
  baffle?: any,
  games?: Game[],
  reviewing?: Game,
  viewing?: Game,
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

  loadImages(imgUrls: string[]) {
    return Promise.all(
      imgUrls.map(url => fetch(url))
    );
  }

  async loadDeps() {
    const games = await getJSON<Game[]>(`${config.api}/game/all`);
    await this.loadImages(games.slice(0, 8).map(g => g.poster));
    (this.state.baffle as any).reveal(500);
    await sleep(1000);
    this.setState({
      ...this.state,
      hasLoaded: true,
      baffle: null,
      games,
    });
    if (window.location.hash) {
      const [actionType, id] = window.location.hash.slice(1).split('--');
      this.setState({
        ...this.state,
        [actionType]: games.find(g => g.id === id)
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
    const startVideo = (ev: any) => {
      const el = ev.target.closest('.game').querySelector('video');
      el.play && el.play();
    }
    const stopVideo = (ev: any) => {
      const el = ev.target.closest('.game').querySelector('video');
      el.load && el.load();
    }
    const playGame = (game: Game) => {
      handleOutboundLink(game.url);
      window.location.hash = 'reviewing--' + game.id;
      (window.location as any) = game.url;
    }
    return (
      <div className="App">
        <header className={`App-header ${!this.state.hasLoaded ? 'loading' : ''}`} style={{ opacity: showHeader ? 1 : 0 }}>
          XRca.de
        </header>

        <div className={`viewing ${viewing && showGames ? 'show' : ''}`} id={viewing ? 'viewing--' + viewing.id : ''}>
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
                <a href={viewing.url} className="play-button" onClick={(ev) => {
                  window.location.hash = 'reviewing--' + viewing.id;
                  handleOutboundLink(viewing.url);
                }}>PLAY</a>
              </div>
            </div>
          </>) : null}
        </div>

        <div className="games" style={{ opacity: showGames ? 1 : 0 }}>
          {(this.state.games || []).map(game => {
            return <div className="game" id={game.id} onMouseEnter={startVideo} onMouseLeave={stopVideo} onClick={() => playGame(game)}>
              <div className="info-button-cont" onClick={(ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                this.setState({
                  ...this.state,
                  viewing: game,
                });
                window.location.hash = 'viewing--' + game.id;
              }}>
                <img src='./info.svg' className='info-button' />
              </div>
              <video poster={game.poster} src={game.video} loop={true}></video>
              <div className="info">
                <div className='rating-cont'>
                  <div className="rating pill"><span className="rating-num">{game.rating || '?'} </span><img src='./star.svg' /></div>
                </div>
                {game.description}
                <br />
                <br />
                <a href={game.url} className="play-button" onClick={() => playGame(game)}>PLAY</a>
              </div>
            </div>
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

                  TODO: add share buttons
                </div>
              </div>
            ) : null
          }
        </div>
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
    this.setState({ reviewSaving: 'pending' });
    await postJSON(`${config.api}/game/rate/${this.state.game.id}`, { value: rating });
    this.setState({ reviewSaving: 'saved' });
  }

  render() {
    return <div>
      {this.state.reviewSaving === 'not_selected'
        ? <>
          <button onClick={() => this.rateGame(1)}>1</button>
          <button onClick={() => this.rateGame(2)}>2</button>
          <button onClick={() => this.rateGame(3)}>3</button>
          <button onClick={() => this.rateGame(4)}>4</button>
          <button onClick={() => this.rateGame(5)}>5</button>
        </>
        :
        this.state.reviewSaving === 'pending'
          ? <>Saving...</>
          : <>Saved</>
      }
    </div>;
  }
}

export default App;

function handleOutboundLink(href: string) {
  (window as any).ga('send', 'event', {
    eventCategory: 'Outbound Link',
    eventAction: 'click',
    eventLabel: href
  });
}