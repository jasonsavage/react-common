import _ from 'underscore';


export function modalProps (props) {
	return _.pick(props, 'show', 'animation', 'backdrop', 'onHide', 'onEntered', 'onExited', 'keyboard');
}

export function isModalOpen (state, modalId = null) {
	if(modalId) {
		const data = state.modals.find(item => item.id === modalId);
		return data && data.isOpen;
	}
	const open = state.modals.filter(item => item.isOpen);
	return (open.size > 0);
}
