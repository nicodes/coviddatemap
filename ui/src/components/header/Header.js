import hamburgerSvg from '../../assets/hamburger.svg'
import githubSvg from '../../assets/github.svg'
import './header.scss'

const Drawer = ({ drawerOpen, setDrawerOpen }) =>
  <header>
    <button
      className='hamburger'
      onClick={() => setDrawerOpen(!drawerOpen)}
    >
      <img src={hamburgerSvg} />
    </button>
    <h1>Covid Date Map</h1>
    <button className='github'>
      <a target='_blank' href='https://github.com/nicodes/coviddatemap'>
        <img src={githubSvg} />
      </a>
    </button>
  </header>

export default Drawer
