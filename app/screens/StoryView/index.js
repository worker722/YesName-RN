import * as reduxActions from "@actions";
import { comparePhone } from "@utils";
import React from 'react';
import { CubeNavigationHorizontal } from "react-native-3dcube-navigation";
import { connect } from "react-redux";
import StoryContainer from "./src/StoryContainer";
const { ApiActions, logger } = reduxActions;

class StoryView extends React.Component {
    state = {
        newIndex: 0,
        currentUserIndex: 0,
        currentScrollValue: 0
    }
    componentDidMount() {
    }
    onStoryNext = (isScroll) => {
        const data = this.getData();
        const { currentUserIndex } = this.state;
        const newIndex = currentUserIndex + 1;
        if (data.length - 1 > currentUserIndex) {
            this.setState({ currentUserIndex: newIndex });
            if (!isScroll) {
                this.modalScroll.scrollTo(newIndex, true);
            }
        } else {
            this.onClose();
        }
    };
    onClose() {
        this.props.getStories(true);
        this.props.getGallery(true);
        this.props.navigation.goBack();
    }
    onStoryPrevious = (isScroll) => {
        const { currentUserIndex } = this.state;
        const newIndex = currentUserIndex - 1;
        if (currentUserIndex > 0) {
            this.setState({ currentUserIndex: newIndex });
            if (!isScroll) {
                this.modalScroll.scrollTo(newIndex, true);
            }
        }
    };
    onScrollChange(scrollValue) {
        const { currentScrollValue } = this.state;
        if (currentScrollValue > scrollValue) {
            this.onStoryNext(true);
            this.setState({ currentScrollValue: scrollValue });
        }
        if (currentScrollValue < scrollValue) {
            this.onStoryPrevious();
            this.setState({ currentScrollValue: scrollValue });
        }
    };
    onDelete(selected_story) {
        const { stories: { mystory }, route: { params: { type } } } = this.props;
        if (type == 0) return;
        this.setState({ forceStop: true });
        this.props.showAlert({
            title: "Confirm",
            message: "Remove from your story?",
            textConfirm: "Remove",
            visible: true,
            onConfirm: async () => {
                await ApiActions.deleteGallery([selected_story.id]);
                this.setState({ forceStop: false });
                if (mystory.gallery.length <= 1) this.props.navigation.goBack();
                this.props.getMyStory(true);
            },
            onClose: () => {
                this.setState({ forceStop: false });
            }
        })
    }
    getData() {
        try {
            const { users: { users, contacts }, stories: { stories, gallery, mystory }, route: { params: { type, user, storyid } } } = this.props;
            if (type == 1) {
                if (mystory?.gallery?.length > 0) {
                    return [{
                        user,
                        stories: mystory.gallery,
                        storyid: mystory.story.id,
                    }]
                }
                return null;
            } else if (type == 2) {
                const data = stories
                    .filter(item => item.storyid == storyid)
                    .map(_story => {
                        const some_index = contacts?.findIndex(v => comparePhone(v.phone, _story.phone));
                        if (some_index < 0) return null;
                        if (storyid != mystory.story.id) {
                            return {
                                user: users.find(item => item.id == _story.userid),
                                stories: gallery?.filter(item => item.storyid == storyid) || [],
                                storyid: storyid,
                            }
                        }

                    })
                    .filter(item => item);
                return data;
            }
            let data = [];
            let set = false;
            stories.forEach(element => {
                if (element.storyid == storyid) {
                    set = true;
                }
                const some_index = contacts?.findIndex(v => comparePhone(v.phone, element.phone));
                if (some_index < 0) return;

                if (!set) return;
                if (element.storyid != mystory.story.id) {
                    data.push({
                        user: users.find(item => item.id == element.userid),
                        stories: gallery?.filter(item => item.storyid == element.storyid) || [],
                        storyid: element.storyid,
                    })
                }
            });
            return data || [];
        } catch (err) {
            logger.error("get story data error", err);
        }
        return [];
    }
    render() {
        const { route: { params: { type, visited_story, index, stop } }, users: { users }, stories: { mystory: { visited } } } = this.props;
        // const init_index = (visited_story?.visited ? 0 : visited_story?.visite_num) || 0;
        const init_index = index || visited_story?.visite_num || 0;

        const { currentUserIndex } = this.state;
        const data = this.getData();
        if (!data) return <></>;
        const { forceStop } = this.state;
        return (
            <CubeNavigationHorizontal
                callBackAfterSwipe={(g) => this.onScrollChange(g)}
                ref={(ref) => this.modalScroll = ref}
            >
                {data.map((item, index) => (
                    <StoryContainer
                        key={index}
                        sendMessage={this.props.sendMessage}
                        onClose={this.onClose.bind(this)}
                        onStoryNext={(e) => this.onStoryNext(e)}
                        onStoryPrevious={(e) => this.onStoryPrevious(e)}
                        visiteStory={this.props.visiteStory}
                        dataStories={item}
                        onDelete={this.onDelete.bind(this)}
                        forceStop={forceStop}
                        type={type}
                        isStop={stop}
                        init_index={init_index}
                        isNewStory={index !== currentUserIndex}
                        zoomable={false}
                        all_users={users}
                        visited_mystory={visited}
                    />
                ))}
            </CubeNavigationHorizontal>
        );
    }
}
const mapStateToProps = (state) => (state)
const mapDispatchToProps = { ...reduxActions }

export default connect(mapStateToProps, mapDispatchToProps)(StoryView);
