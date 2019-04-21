const React = require('react');
const PropTypes = require('prop-types');
const { playerContextFilter, PlayerPropTypes } = require('@cassette/core');
const { VideoDisplay } = require('@cassette/components');
const {
  themes,
  Window,
  WindowHeader,
  WindowContent,
  Toolbar,
  Button,
  Cutout
} = require('react95');
const { ThemeProvider } = require('styled-components');
const ResizeObserver = require('resize-observer-polyfill').default;

const MediaBtn = require('./MediaBtn');
const SeekButton = require('./SeekButton');
const Icon = require('./Icon');
const convertToTime = require('./convertToTime');

const windowHeaderStyle = {
  padding: 0,
  height: 'initial',
  lineHeight: '1.4em'
};
const headerToolbarStyle = {
  padding: 0
};
const windowContentStyle = {
  padding: 0,
  marginRight: 2,
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column'
};

const Spacer = () => <div style={{ width: 8 }} />;
const TinySpacer = () => <div style={{ width: 3 }} />;

const titleBarButtonStyle = { width: 'initial', height: 'initial' };

class MediaPlayerView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      width: Infinity
    };
    this.randomId = ('id' + Math.random()).replace(/\./g, '-');
  }

  componentDidMount() {
    const elem = document.getElementById(this.randomId);
    this.resizeObserver = new ResizeObserver((entries, observer) => {
      for (const entry of entries) {
        this.setState({
          width: entry.contentRect.width
        });
      }
    });
    this.resizeObserver.observe(elem);
  }

  componentWillUnmount() {
    this.resizeObserver.disconnect();
  }

  render() {
    const {
      getDisplayText,
      showVideo,
      fullscreenEnabled,
      className,
      style,
      fullscreen,
      requestFullscreen,
      requestExitFullscreen,
      playlist,
      activeTrackIndex,
      paused,
      currentTime,
      onTogglePause,
      onBackSkip,
      onForwardSkip,
      onSeekPreview,
      onSeekComplete
    } = this.props;
    const { width } = this.state;
    return (
      <ThemeProvider theme={themes.default}>
        <Window
          id={this.randomId}
          style={{
            fontSize: 13,
            ...style,
            ...(fullscreen
              ? {
                margin: 0,
                width: '100%',
                maxWidth: 'initial',
                height: '100%'
              }
              : {})
          }}
          className={className}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: fullscreen ? '100%' : undefined
            }}
          >
            <WindowHeader style={windowHeaderStyle}>
              <Toolbar style={headerToolbarStyle}>
                <TinySpacer />
                <Icon name={showVideo ? 'video' : 'audio'} />
                <TinySpacer />
                <span
                  style={{
                    flexGrow: 1,
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }}
                >
                  {getDisplayText(playlist[activeTrackIndex])}
                  &nbsp;
                  ({paused ? 'paused' : 'playing'})
                </span>
                <MediaBtn
                  title="Minimize"
                  icon="minimize"
                  style={titleBarButtonStyle}
                  disabled
                />
                <MediaBtn
                  title="Fullscreen"
                  icon={fullscreen ? 'unmaximize' : 'maximize'}
                  style={titleBarButtonStyle}
                  onClick={fullscreen ? requestExitFullscreen : requestFullscreen}
                  disabled={!fullscreenEnabled}
                />
                <TinySpacer />
                <MediaBtn
                  title="Close"
                  icon="x"
                  style={titleBarButtonStyle}
                  disabled
                />
                <TinySpacer />
              </Toolbar>
            </WindowHeader>
            <Toolbar style={{ ...headerToolbarStyle, position: 'relative' }}>
              {['File', 'Edit', 'Device', 'Scale', 'Help'].map(menuHeader =>
                <Button
                  key={menuHeader}
                  style={{ fontSize: 13, height: '1.6em' }}
                  size="sm"
                  flat
                  disabled
                >
                  <span style={{ textDecoration: 'underline' }}>
                    {menuHeader[0]}
                  </span>
                  {menuHeader.slice(1)}
                </Button>
              )}
            </Toolbar>
            <WindowContent style={windowContentStyle}>
              {showVideo && <VideoDisplay style={{ flexGrow: 1 }} />}
              <Toolbar>
                <MediaBtn
                  title={paused ? 'Play' : 'Pause'}
                  icon={paused ? 'play' : 'pause'}
                  onClick={onTogglePause}
                />
                <MediaBtn title="Stop" icon="stop" disabled />
                <MediaBtn title="Eject" icon="eject" disabled />
                {width >= 260 &&
                  <React.Fragment>
                    <Spacer />
                    <MediaBtn title="Previous" icon="backskip" onClick={onBackSkip} />
                    <SeekButton type="rewind" />
                    <SeekButton type="fastforward" />
                    <MediaBtn
                      title="Next"
                      icon="forwardskip"
                      onClick={onForwardSkip}
                    />
                  </React.Fragment>}
                {width >= 310 &&
                  <React.Fragment>
                    <Spacer />
                    <MediaBtn
                      title="Start Selection"
                      icon="selectionstart"
                      disabled
                    />
                    <MediaBtn
                      title="End Selection"
                      icon="selectionend"
                      disabled
                    />
                  </React.Fragment>}
                <Spacer />
                <Cutout shadow={false} style={{ flexGrow: 1 }}>
                  <span style={{ marginLeft: 2 }}>
                    {convertToTime(currentTime)}
                  </span>
                </Cutout>
              </Toolbar>
            </WindowContent>
          </div>
        </Window>
      </ThemeProvider>
    );
  }
}

MediaPlayerView.propTypes = {
  getDisplayText: PropTypes.func.isRequired,
  showVideo: PropTypes.bool.isRequired,
  fullscreenEnabled: PropTypes.bool.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
  fullscreen: PropTypes.bool.isRequired,
  requestFullscreen: PropTypes.func.isRequired,
  requestExitFullscreen: PropTypes.func.isRequired,
  playlist: PropTypes.arrayOf(PlayerPropTypes.track.isRequired).isRequired,
  activeTrackIndex: PropTypes.number.isRequired,
  paused: PropTypes.bool.isRequired,
  onTogglePause: PropTypes.func.isRequired,
  onBackSkip: PropTypes.func.isRequired,
  onForwardSkip: PropTypes.func.isRequired
};

module.exports = playerContextFilter(
  MediaPlayerView,
  [
    'fullscreen',
    'requestFullscreen',
    'requestExitFullscreen',
    'playlist',
    'activeTrackIndex',
    'paused',
    'currentTime',
    'onSeekPreview',
    'onSeekComplete',
    'onTogglePause',
    'onBackSkip',
    'onForwardSkip'
  ]
);
