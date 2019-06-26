import React from 'react';
import './App.css';

import baffle from 'baffle';

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

const games: Game[] = [
  {
    id: '1',
    title: 'Barista Express',
    video: './baristaexpress.mp4',
    poster: 'https://supermedium.com/superassets/site/baristaexpress.jpg',
    description: 'Virtually be a barista in your own cafe.',
    rating: 4.7,
    url: 'https://constructarca.de/construct-arcade/game/barista-express/game/'
  }, {
    id: '2',
    title: 'Barista Express',
    video: './baristaexpress.mp4',
    poster: 'https://supermedium.com/superassets/site/baristaexpress.jpg',
    description: 'Virtually be a barista in your own cafe.',
    rating: 4.7,
    url: 'https://constructarca.de/construct-arcade/game/barista-express/game/'
  }, {
    id: '3',
    title: 'Barista Express',
    video: './baristaexpress.mp4',
    poster: 'https://supermedium.com/superassets/site/baristaexpress.jpg',
    description: 'Virtually be a barista in your own cafe.',
    rating: 4.7,
    url: 'https://constructarca.de/construct-arcade/game/barista-express/game/'
  }, {
    id: '4',
    title: 'Barista Express',
    video: './baristaexpress.mp4',
    poster: 'https://supermedium.com/superassets/site/baristaexpress.jpg',
    description: 'Virtually be a barista in your own cafe.',
    rating: 4.7,
    url: 'https://constructarca.de/construct-arcade/game/barista-express/game/'
  }, {
    id: '5',
    title: 'Barista Express',
    video: './baristaexpress.mp4',
    poster: 'https://supermedium.com/superassets/site/baristaexpress.jpg',
    description: 'Virtually be a barista in your own cafe.',
    rating: 4.7,
    url: 'https://constructarca.de/construct-arcade/game/barista-express/game/'
  }, {
    id: '6',
    title: 'Barista Express',
    video: './baristaexpress.mp4',
    poster: 'https://supermedium.com/superassets/site/baristaexpress.jpg',
    description: 'Virtually be a barista in your own cafe.',
    rating: 4.7,
    url: 'https://constructarca.de/construct-arcade/game/barista-express/game/'
  }, {
    id: '7',
    title: 'Barista Express',
    video: './baristaexpress.mp4',
    poster: 'https://supermedium.com/superassets/site/baristaexpress.jpg',
    description: 'Virtually be a barista in your own cafe.',
    rating: 4.7,
    url: 'https://constructarca.de/construct-arcade/game/barista-express/game/'
  }, {
    id: '8',
    title: 'Barista Express',
    video: './baristaexpress.mp4',
    poster: 'https://supermedium.com/superassets/site/baristaexpress.jpg',
    description: 'Virtually be a barista in your own cafe.',
    rating: 4.7,
    url: 'https://constructarca.de/construct-arcade/game/barista-express/game/'
  }
];

interface Game {
  id: string,
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
    await this.loadImages(games.slice(0, 8).map(g => g.poster));
    (this.state.baffle as any).reveal(500);
    await sleep(1000);
    this.setState({
      ...this.state,
      hasLoaded: true,
      baffle: null,
      games,
    });
  }

  componentDidMount() {
    if (window.location.hash) {
      const [actionType, id] = window.location.hash.slice(1).split('--');
      this.setState({
        ...this.state,
        [actionType]: games.find(g => g.id === id)
      });
    }
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
    const startVideo = (ev:any) => ev.target.play && ev.target.play();
    const stopVideo = (ev:any) => ev.target.load && ev.target.load();
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
                  <div className="rating pill">{viewing.rating} <img src='./star.svg' /></div>
                </div>
                <a href={viewing.url} className="play-button" onClick={(ev) => {
                  window.location.hash = 'reviewing--' + viewing.id;
                }}>PLAY</a>
              </div>
            </div>
          </>) : null}
        </div>

        <div className="games" style={{ opacity: showGames ? 1 : 0 }}>
          {(this.state.games || []).map(game => {
            return <div className="game" id={game.id}>
              <div className="info-button-cont" onClick={() => {
                this.setState({
                  ...this.state,
                  viewing: game,
                });
                window.location.hash = 'viewing--' + game.id;
              }}>
                <img src='./info.svg' className='info-button' />
              </div>
              <video poster={game.poster} src={game.video} loop={true} onMouseEnter={startVideo} onMouseLeave={stopVideo}></video>
              <div className='rating-cont'>
                <div className="rating pill">{game.rating} <img src='./star.svg' /></div>
              </div>
              <div className="info">
                {game.description}
                <br />
                <br />
                <a href={game.url} className="play-button" onClick={(ev) => {
                  window.location.hash = 'reviewing--' + game.id;
                }}>PLAY</a>
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
                  <div className="rating">
                    TODO: add rating buttons here
                  </div>

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

export default App;
