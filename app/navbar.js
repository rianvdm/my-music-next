import Link from 'next/link';

export default function NavBar() {
  return (
    <nav style={navStyle}>
      <ul style={ulStyle}>
        <li style={liStyle}>
          <Link href="/">Home</Link>
        </li>
        <li style={liStyle}>
          <Link href="/about">About</Link>
        </li>
      </ul>
    </nav>
  );
}

const navStyle = {
  padding: '1em',
  background: '#ffffff',
  color: '#FF6C00',
  textAlign: 'center'
};

const ulStyle = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  justifyContent: 'center',
};

const liStyle = {
  margin: '0 1em',
};