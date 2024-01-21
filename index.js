const CLIENT_ID = '7a13960931195c24c48f';
const CLIENT_SECRET = '214103bdd53b3e95841df77aa0c82c5ff2c0c8db';
const REPOS_PER_PAGE_DEFAULT = 10;
const MAX_REPOS_PER_PAGE = 100;

async function getUser(name) {
  const res = await fetch(`https://api.github.com/users/${name}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`);
  const profile = await res.json();
  return profile;
}

async function getRepos(profile, page = 1, perPage = REPOS_PER_PAGE_DEFAULT) {
  const res = await fetch(`${profile.repos_url}?page=${page}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`);
  const repos = await res.json();
  return repos;
}

function showProfile(profile){
  document.querySelector('.profile').innerHTML=`
  <img
          src="${profile.avatar_url}"
          alt="letstrie"
        />
        <p class="name">${profile.name}</p>
        <p class="username login">${profile.login}</p>
        <p class="bio">
        ${profile.bio}
        </p>

        <div class="followers-stars">
          <p>
            <ion-icon name="people-outline"></ion-icon>
            <span class="followers">${profile.followers}</span> followers
          </p>
          <span class="dot">·</span>
          <p><span class="following">${profile.following}</span> following</p>
        </div>

        <p class="company">
          <ion-icon name="business-outline"></ion-icon>
          ${profile.company}
        </p>
        <p class="location">
          <ion-icon name="location-outline"></ion-icon>${profile.location}
        </p>
  
  
  `

}

function showRepos(repos, currentPage = 1, perPage = REPOS_PER_PAGE_DEFAULT) {
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentRepos = repos.slice(startIndex, endIndex);

  let newHTML = ' ';
  for (let repo of currentRepos) {
    newHTML += `
      <div class="repo">
        <div class="repo_name">
          <a href="#${repo.html_url}">${repo.name}</a>
        </div>
        <p>
          <span class="circle"></span> ${repo.language}
          <ion-icon name="star-outline"></ion-icon>${repo.watchers_count}
          <ion-icon name="git-branch-outline"></ion-icon>${repo.forks_count}
        </p>
      </div>
    `;
  }
  document.querySelector('.repos').innerHTML = newHTML;
}

function handlePagination(profile, repos) {
  const totalPages = Math.ceil(repos.length / REPOS_PER_PAGE_DEFAULT);
  // console.log('totalpages is:',totalPages);
  // console.log('repos is:',repos.length);


  document.querySelectorAll('.page-button').forEach((button) => {
    button.addEventListener('click', async (e) => {
      // e.preventDefault();
      const page = parseInt(button.dataset.page);
      const reposPerPage = parseInt(document.querySelector('#reposPerPage').value) || REPOS_PER_PAGE_DEFAULT;

      const updatedRepos = await getRepos(profile, page, reposPerPage);
      showRepos(updatedRepos, page, reposPerPage);
    });
  });

  document.querySelector('#reposPerPage').addEventListener('change', async (e) => {
    // e.preventDefault();
    const reposPerPage = parseInt(document.querySelector('#reposPerPage').value) || REPOS_PER_PAGE_DEFAULT;

    const updatedRepos = await getRepos(profile, 1, reposPerPage);
    showRepos(updatedRepos, 1, reposPerPage);
  });
}


document.querySelector('#search').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.querySelector('#findByUsername').value;

  if (username.length > 0) {
    document.querySelector('.lds-roller').style.display = 'block';
    document.querySelector('.user-details').style.display = 'none';
    document.querySelector('.notFound').style.display = 'none';

    try {
      const profile = await getUser(username);
      // console.log(profile);

      document.querySelector('.lds-roller').style.display = 'none';

      if (profile.message === 'Not Found') {
        document.querySelector('.notFound').style.display = 'block';
      } else {
        const repos = await getRepos(profile);
        // console.log('no. repo:',repos);

        document.querySelector('.user-details').style.display = 'flex';
        showRepos(repos);
        showProfile(profile);

        handlePagination(profile, repos);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      document.querySelector('.lds-roller').style.display = 'none';
    }
  }
});
