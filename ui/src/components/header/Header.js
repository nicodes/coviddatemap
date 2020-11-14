import githubSvg from '../../assets/github.svg'
import './header.scss'

const Drawer = ({ drawerOpen, setDrawerOpen }) =>
  <header>
    <button onClick={() => setDrawerOpen(!drawerOpen)}>
      {drawerOpen ? '<' : '>'}
    </button>
    <button className={'github'}>
      <a target='_blank' href='https://github.com/nicodes/coviddatemap'>
        <img src={githubSvg} />
      </a>
    </button>
  </header>

export default Drawer
