import hamburgerSvg from '../../assets/hamburger.svg'
import githubSvg from '../../assets/github.svg'
import styles from './header.module.scss'

const Drawer = ({ drawerOpen, setDrawerOpen }) =>
  <header className={styles.header}>
    <button className={styles.hamburger} onClick={() => setDrawerOpen(!drawerOpen)}>
      <img src={hamburgerSvg} />
    </button>
    <h1>Covid Date Map</h1>
    {/* <button>About</button> */}
    <button>
      <a target='_blank' href='https://www.paypal.com/donate?hosted_button_id=2HHJW2SLA3UVC'>
        Donate
      </a>
    </button>
    <button className={styles.github}>
      <a target='_blank' href='https://github.com/nicodes/coviddatemap'>
        <img src={githubSvg} />
      </a>
    </button>
  </header>

export default Drawer
