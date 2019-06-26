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
    id: 1,
    title: 'Barista Express',
    poster: 'https://supermedium.com/superassets/site/baristaexpress.jpg',
    description: 'Virtually be a barista in your own cafe.',
    rating: 4.7,
    url: 'https://constructarca.de/construct-arcade/game/barista-express/game/'
  }, {
    id: 2,
    title: 'Barista Express',
    poster: 'https://supermedium.com/superassets/site/baristaexpress.jpg',
    description: 'Virtually be a barista in your own cafe.',
    rating: 4.7,
    url: 'https://constructarca.de/construct-arcade/game/barista-express/game/'
  }, {
    id: 3,
    title: 'Barista Express',
    poster: 'https://supermedium.com/superassets/site/baristaexpress.jpg',
    description: 'Virtually be a barista in your own cafe.',
    rating: 4.7,
    url: 'https://constructarca.de/construct-arcade/game/barista-express/game/'
  }, {
    id: 4,
    title: 'Barista Express',
    poster: 'https://supermedium.com/superassets/site/baristaexpress.jpg',
    description: 'Virtually be a barista in your own cafe.',
    rating: 4.7,
    url: 'https://constructarca.de/construct-arcade/game/barista-express/game/'
  }, {
    id: 5,
    title: 'Barista Express',
    poster: 'https://supermedium.com/superassets/site/baristaexpress.jpg',
    description: 'Virtually be a barista in your own cafe.',
    rating: 4.7,
    url: 'https://constructarca.de/construct-arcade/game/barista-express/game/'
  }, {
    id: 6,
    title: 'Barista Express',
    poster: 'https://supermedium.com/superassets/site/baristaexpress.jpg',
    description: 'Virtually be a barista in your own cafe.',
    rating: 4.7,
    url: 'https://constructarca.de/construct-arcade/game/barista-express/game/'
  }, {
    id: 7,
    title: 'Barista Express',
    poster: 'https://supermedium.com/superassets/site/baristaexpress.jpg',
    description: 'Virtually be a barista in your own cafe.',
    rating: 4.7,
    url: 'https://constructarca.de/construct-arcade/game/barista-express/game/'
  }, {
    id: 8,
    title: 'Barista Express',
    poster: 'https://supermedium.com/superassets/site/baristaexpress.jpg',
    description: 'Virtually be a barista in your own cafe.',
    rating: 4.7,
    url: 'https://constructarca.de/construct-arcade/game/barista-express/game/'
  }
];

interface Game {
  id: number,
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
      this.setState({
        reviewing: games.find(g => g.id === Number(window.location.hash.slice(1)))
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
    const closeOverlay = () => {
      window.location.hash = '';
      this.setState({ ...this.state, reviewing: undefined });
    };
    return (
      <div className="App">
        <header className={`App-header ${!this.state.hasLoaded ? 'loading' : ''}`} style={{ opacity: showHeader ? 1 : 0 }}>
          XRca.de
        </header>
        <div className="games" style={{ opacity: showGames ? 1 : 0 }}>
          {(this.state.games || []).map(game => {
            return <div className="game">
              <video poster={game.poster}></video>
              <div className='rating-cont'>
                <div className="rating pill">{game.rating}*</div>
              </div>
              <div className="info">
                {game.description}
                <br />
                <br />
                <a href={game.url} className="play-button" onClick={(ev) => {
                  window.location.hash = '' + game.id;
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
