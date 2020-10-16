const expandBodyButton = document.getElementById('expand-body-button');
const blogBodyModal = document.getElementById('body-expanded-modal')
const cancelChanges = document.getElementById('cancel-body');
const confirmChangesButton = document.getElementById('confirm-body');
const blogBodyTextarea_expanded = document.getElementById('body-expanded');
const blogBodyTextarea = document.getElementById('body')


expandBodyButton.addEventListener('click', (e) => {
  e.preventDefault();
  const blogBody = blogBodyTextarea.value
  blogBodyTextarea_expanded.value = blogBody;


  blogBodyModal.classList.add('open');
  document.body.classList.add('modal-open')
})

cancelChanges.addEventListener('click', e => {
  e.preventDefault();
  closeModal()
})

document.body.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    confirmChanges()
  }
})

confirmChangesButton.addEventListener('click', (e) => {
  e.preventDefault();

  confirmChanges();
})


function confirmChanges() {
  const blogBody = blogBodyTextarea_expanded.value;
  blogBodyTextarea.value = blogBody
  closeModal()
}

function closeModal() {
  blogBodyModal.classList.remove('open');
  document.body.classList.remove('modal-open');
}